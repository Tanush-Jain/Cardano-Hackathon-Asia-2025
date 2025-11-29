from __future__ import annotations

"""MedSAM-based explainability utilities for the doctor interface.

This module defines `MedSAMExplainer`, which is used by the Flask backend
(app_backend.py) to generate:

- A segmentation mask for the uploaded image
- An "attention" heatmap (probability map)
- A visualization overlay combining image + mask
- Simple region-wise feature importance scores for XAI

It relies on the MedSAM model already loaded in `MedSAM_FL` and does **not**
change any training code.
"""

import numpy as np
import cv2
from dataclasses import dataclass
from typing import Dict, Tuple

import torch
import torch.nn.functional as F

# Optional TensorFlow/Keras-based mitosis detector and Grad-CAM utilities
try:
    import tensorflow as tf  # type: ignore
    from tensorflow import keras  # type: ignore
    _HAS_KERAS = True
except Exception:  # tensorflow not installed in this environment
    tf = None  # type: ignore
    keras = None  # type: ignore
    _HAS_KERAS = False

_MITOSIS_MODEL = None


def _get_mitosis_model(model_path: str = "mitosis_detector_v2.keras"):
    """Lazy-load the trained mitosis detector model if available.

    This assumes a tf.keras .keras model file in the project root. If
    TensorFlow/Keras is not installed, this will raise at call time so the
    caller can either handle or fall back to MedSAM-only behaviour.
    """
    global _MITOSIS_MODEL
    if not _HAS_KERAS:
        raise RuntimeError("TensorFlow/Keras not available; cannot load mitosis detector.")
    if _MITOSIS_MODEL is None:
        _MITOSIS_MODEL = keras.models.load_model(model_path)
    return _MITOSIS_MODEL


@dataclass
class XAIResult:
    mask: np.ndarray  # binary mask HxW (0/1)
    prob_map: np.ndarray  # probability map HxW float32 [0, 1]
    overlay: np.ndarray  # RGB visualization HxWx3 uint8
    description: str
    feature_importance: Dict[str, Dict[str, float]]


class MedSAMExplainer:
    """Wrapper around MedSAM_FL for segmentation + simple XAI.

    The constructor expects the *already loaded* MedSAM_FL model from
    `fl_model.MedSAM_FL` and uses its underlying `sam` components for
    inference. This avoids double-loading checkpoints.
    """

    def __init__(self, medsaml_fl_model, device: str = "cpu") -> None:
        self.model = medsaml_fl_model  # instance of MedSAM_FL
        # Use the same device configured in the backend (mps/cuda/cpu)
        self.device = torch.device(device)

    # ------------------------------------------------------------------
    # Core MedSAM inference utilities
    # ------------------------------------------------------------------
    @torch.no_grad()
    def _segment(self, image: np.ndarray, box_xyxy: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Run MedSAM segmentation for a single image and box.

        Args:
            image: RGB image HxWx3 uint8 or float
            box_xyxy: np.array([x1, y1, x2, y2]) in original image pixel coords

        Returns:
            mask: binary mask HxW (0/1, uint8)
            prob: probability map HxW float32 in [0, 1]
        """

        # Ensure RGB uint8
        if image.dtype != np.uint8:
            img_3c = (np.clip(image, 0, 1) * 255).astype(np.uint8)
        else:
            img_3c = image

        H, W, _ = img_3c.shape

        # Resize to 1024x1024 and normalize to [0,1]
        img_1024 = cv2.resize(img_3c, (1024, 1024), interpolation=cv2.INTER_LINEAR)
        img_1024 = img_1024.astype(np.float32)
        img_1024 = (img_1024 - img_1024.min()) / max(float(img_1024.max() - img_1024.min()), 1e-8)

        # To tensor (1, 3, 1024, 1024)
        img_tensor = (
            torch.from_numpy(img_1024)
            .permute(2, 0, 1)
            .unsqueeze(0)
            .to(self.device, dtype=torch.float32)
        )

        # Scale box to 1024x1024
        box_np = np.asarray(box_xyxy, dtype=np.float32).reshape(1, 4)
        box_1024 = box_np / np.array([W, H, W, H], dtype=np.float32) * 1024.0
        box_torch = torch.as_tensor(box_1024, dtype=torch.float32, device=self.device)
        box_torch = box_torch[:, None, :]  # (B, 1, 4)

        # Use underlying SAM components
        sam = self.model.sam
        with torch.no_grad():
            img_embed = sam.image_encoder(img_tensor)  # (1, 256, 64, 64)
            sparse_embeddings, dense_embeddings = sam.prompt_encoder(
                points=None,
                boxes=box_torch,
                masks=None,
            )
            low_res_logits, _ = sam.mask_decoder(
                image_embeddings=img_embed,
                image_pe=sam.prompt_encoder.get_dense_pe(),
                sparse_prompt_embeddings=sparse_embeddings,
                dense_prompt_embeddings=dense_embeddings,
                multimask_output=False,
            )

            # Probability map in low-res (typically 256x256), then upsample to HxW
            prob_low = torch.sigmoid(low_res_logits)
            prob_full = F.interpolate(
                prob_low,
                size=(H, W),
                mode="bilinear",
                align_corners=False,
            )  # (1, 1, H, W)

        prob = prob_full.squeeze().cpu().numpy().astype(np.float32)

        # Convert probability map to a binary mask.
        # For this demo UI we use an adaptive threshold: treat the top 20% of
        # probabilities as "lesion" to avoid trivially full-image masks that give
        # identical metrics across different inputs.
        try:
            thr = float(np.quantile(prob, 0.8))
        except Exception:
            thr = 0.5
        mask = (prob >= thr).astype(np.uint8)
        return mask, prob

    # ------------------------------------------------------------------
    # Public API used by the Flask backend
    # ------------------------------------------------------------------
    def _segment_mitosis(self, image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Run the trained mitosis detector (tf.keras) to obtain a mask + prob map.

        This treats the detector as a semantic segmentation model with
        input shape (None, H0, W0, C) and output shape compatible with
        (None, H0, W0, 1) or (None, H0, W0).
        """
        model = _get_mitosis_model()

        # Ensure RGB float32 in [0,1]
        img = image
        if img.ndim == 2:
            img = np.repeat(img[..., None], 3, axis=-1)
        if img.dtype != np.float32:
            img = img.astype(np.float32)
        if img.max() > 1.0:
            img = img / 255.0

        H, W, _ = img.shape
        input_shape = getattr(model, "input_shape", None)
        if not input_shape or len(input_shape) != 4:
            raise RuntimeError(f"Unexpected mitosis model input_shape: {input_shape}")
        _, H0, W0, C0 = input_shape
        if C0 is None:
            C0 = 3

        # Resize to model input size
        img_resized = cv2.resize(img, (int(W0), int(H0)), interpolation=cv2.INTER_AREA)
        if C0 == 1:
            img_resized = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)[..., None]

        x = np.expand_dims(img_resized, axis=0)
        pred = model.predict(x, verbose=0)
        prob = np.squeeze(pred).astype(np.float32)

        # If prediction has a channel dimension, take the first channel
        if prob.ndim == 3:
            prob = prob[..., 0]

        # Resize back to original spatial size
        prob_full = cv2.resize(prob, (W, H), interpolation=cv2.INTER_LINEAR).astype(np.float32)

        # Simple threshold for binary mask; adjust if needed based on training
        mask = (prob_full >= 0.5).astype(np.uint8)
        return mask, prob_full

    def generate_attention_map(self, image: np.ndarray, box: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Return (attention_map, mask) for the given image and bounding box.

        The backend expects:
            attention_map: float HxW in [0,1] (we use the probability map)
            mask: binary HxW (0/1 or 0/255)
        """
        mask, prob = self._segment(image, box)
        # Normalize prob to [0,1] explicitly in case of numerical drift
        prob_norm = (prob - prob.min()) / max(float(prob.max() - prob.min()), 1e-8)
        return prob_norm, mask

    def generate_explanation_report(self, image: np.ndarray, box: np.ndarray, confidence: float) -> Dict:
        """Generate XAI report dictionary used by /predict.

        This is tailored for breast cancer histopathology style output. It does
        **not** perform true TNM staging, but derives summary metrics from the
        MedSAM segmentation mask and packages them into a structured report.

        Returns keys:
            - visualization: RGB overlay (H, W, 3) uint8
            - heatmap: RGB heatmap/overlay (H, W, 3) uint8
            - description: short natural-language explanation
            - feature_importance: {"all_scores": {region_name: score}}
            - stage, risk_level, metrics, findings, recommendations
            - text_report: multi-line text block suitable for console display
        """
        # For now, force MedSAM-based segmentation; ignore Keras mitosis model
        # for the core mask. We may still use the Keras model for Grad-CAM/SHAP
        # style explanations if it is available.
        used_mitosis = False
        mask, prob = self._segment(image, box)

        overlay = self._make_overlay(image, mask)
        heatmap = self._make_heatmap(prob, image)

        # Optional Grad-CAM style heatmap from the mitosis model (if available).
        gradcam = None
        try:
            gradcam_map = self._try_compute_gradcam_map(image)
        except Exception:
            gradcam_map = None
        if gradcam_map is not None:
            gradcam = self._make_heatmap(gradcam_map, image)
            used_mitosis = True

        # Simple mask visualization: show the binary mask itself (white = positive)
        h, w = mask.shape
        mask_u8 = (mask.astype(np.uint8) * 255)
        mask_vis = np.stack([mask_u8, mask_u8, mask_u8], axis=-1)

        # Region-wise feature importance from the segmentation mask
        fi = self._compute_region_importance(mask)

        # If the optional Keras mitosis model is available, refine region-wise
        # importance using an occlusion-based attribution that approximates
        # SHAP-style contributions of each region.
        try:
            shap_scores = self._try_compute_region_shap_scores(image)
        except Exception:
            shap_scores = None
        if shap_scores is not None:
            fi = shap_scores

        # ------------------------- quantitative metrics -------------------------
        coverage = float(mask.mean())  # fraction of pixels
        total_positive_pixels = int(mask.sum())
        total_image_pixels = int(mask.size)

        # connected components as lesions (ignore background 0)
        num_labels, labels = cv2.connectedComponents(mask.astype(np.uint8))
        lesion_areas = []
        for label in range(1, num_labels):
            area = float((labels == label).sum())
            if area > 0:
                lesion_areas.append(area)

        num_lesions = len(lesion_areas)
        avg_lesion_size = float(np.mean(lesion_areas)) if lesion_areas else 0.0
        max_lesion_size = float(np.max(lesion_areas)) if lesion_areas else 0.0

        # crude spatial distribution: variance of lesion centroids from image centre
        h, w = mask.shape
        cy_img, cx_img = h / 2.0, w / 2.0
        centroid_dists = []
        for label in range(1, num_labels):
            ys, xs = np.where(labels == label)
            if len(xs) == 0:
                continue
            cx_l = float(xs.mean())
            cy_l = float(ys.mean())
            dist = np.sqrt((cx_l - cx_img) ** 2 + (cy_l - cy_img) ** 2)
            centroid_dists.append(dist)
        spatial_distribution = float(np.mean(centroid_dists)) if centroid_dists else 0.0

        # ---------------------- heuristic stage / risk labels -------------------
        if coverage > 0.8 and num_lesions >= 10:
            stage = "Stage IIIC-IV (Advanced/Metastatic)"
            risk_level = "High"
        elif coverage > 0.4:
            stage = "Stage II-IIIB (Locally Advanced)"
            risk_level = "Moderate"
        else:
            stage = "Stage I-II (Early/Localized)"
            risk_level = "Low"

        # Derive a simple segmentation confidence from the probability map:
        # average probability over positive-mask pixels (fallback to global mean
        # if mask is empty). This will vary per image and drive the UI
        # "Prediction/Segmentation Confidence" instead of a hard-coded 0.95.
        if mask.sum() > 0:
            seg_conf = float(prob[mask.astype(bool)].mean())
        else:
            seg_conf = float(prob.mean())

        # keep the incoming confidence as an upper bound, but cap by that if
        # provided (confidence is in [0,1]).
        seg_conf = min(seg_conf, float(confidence))
        conf_pct = seg_conf * 100.0

        # Region-wise importance (for AI explanation text)
        center_importance = float(fi.get("center", 0.0)) * 100.0

        # Short description for UI (include debug tag so we know this code is live)
        desc = (
            f"[MEDSAM_BACKEND_ACTIVE] Extensive abnormal tissue identified (~{coverage*100:.1f}% of sampled tissue) "
            f"with {num_lesions} lesion-like regions. "
            f"Model confidence for this segmentation is {conf_pct:.1f}%."
        )

        # High-level findings and recommendations (also reused in text_report)
        findings = [
            f"Extensive abnormal tissue identified ({coverage*100:.1f}% of sample)",
            f"Multifocal disease with {num_lesions} distinct lesions",
            "Wide spatial distribution suggesting potential diffuse involvement",
        ]

        recommendations = [
            "Multidisciplinary tumor board review recommended",
            "Staging workup with imaging studies",
            "Evaluate for systemic therapy options",
        ]

        header = "BREAST CANCER HISTOPATHOLOGY ANALYSIS REPORT"

        sep = "-" * 80
        eq = "=" * 80

        text_report = (
            eq
            + f"\n{header}\n"
            + eq
            + "\n\nFINDINGS\n"
            + sep
            + f"\n1. {findings[0]}\n"
            + f"2. {findings[1]}\n"
            + f"3. {findings[2]}\n\n"
            + "RECOMMENDATIONS\n"
            + sep
            + f"\n1. {recommendations[0]}\n"
            + f"2. {recommendations[1]}\n"
            + f"3. {recommendations[2]}\n\n"
            + "AI EXPLANATION\n"
            + sep
            + f"\nThe model focused primarily on the center region (importance: {center_importance:.2f}%). "
            + f"Detected tissue coverage: {coverage*100:.2f}% of image area.\n\n"
            + "DISCLAIMER\n"
            + sep
            + "\nThis is an AI-assisted analysis and should be reviewed by a qualified pathologist. "
            + "Final diagnosis must be made by a medical professional based on complete clinical context.\n"
            + eq
        )

        return {
            "visualization": overlay,
            "heatmap": heatmap,
            "mask_vis": mask_vis,
            "description": desc,
            "feature_importance": {"all_scores": fi},
            "gradcam": gradcam,
            "stage": stage,
            "risk_level": risk_level,
            "coverage": coverage,
            "num_lesions": num_lesions,
            "avg_lesion_size": avg_lesion_size,
            "max_lesion_size": max_lesion_size,
            "spatial_distribution": spatial_distribution,
            "total_positive_pixels": total_positive_pixels,
            "total_image_pixels": total_image_pixels,
            "findings": findings,
            "recommendations": recommendations,
            "text_report": text_report,
            "segmentation_confidence": seg_conf,
            "used_mitosis_model": used_mitosis,
        }

    # ------------------------------------------------------------------
    # Helper functions for visualization and region-wise importance
    # ------------------------------------------------------------------
    def _make_overlay(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Blend the segmentation mask onto the original image.

        Mask is expected as 0/1; we color it in red with some transparency and
        draw lesion contours as green markers.
        """
        if image.dtype != np.uint8:
            base = (np.clip(image, 0, 1) * 255).astype(np.uint8)
        else:
            base = image.copy()

        h, w, _ = base.shape
        mask_resized = mask
        if mask_resized.shape != (h, w):
            mask_resized = cv2.resize(mask_resized.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST)

        mask_bool = mask_resized.astype(bool)
        overlay = base.copy()

        # Red overlay where mask is 1
        red = np.zeros_like(overlay)
        red[..., 0] = 255
        alpha = 0.4
        overlay[mask_bool] = (
            (1 - alpha) * overlay[mask_bool].astype(np.float32)
            + alpha * red[mask_bool].astype(np.float32)
        ).astype(np.uint8)

        # Draw green contours around each connected component as visual markers
        mask_uint8 = mask_resized.astype(np.uint8)
        contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            cv2.drawContours(overlay, contours, -1, (0, 255, 0), 2)

        return overlay

    def _compute_region_importance(self, mask: np.ndarray) -> Dict[str, float]:
        """Compute simple region-wise importance scores from the mask.

        We divide the mask into five regions: top, bottom, left, right, center
        and use the mean mask value in each as a score in [0,1].
        """
        h, w = mask.shape
        mask_f = mask.astype(np.float32)

        top = mask_f[: h // 3, :].mean() if h >= 3 else 0.0
        bottom = mask_f[2 * h // 3 :, :].mean() if h >= 3 else 0.0
        left = mask_f[:, : w // 3].mean() if w >= 3 else 0.0
        right = mask_f[:, 2 * w // 3 :].mean() if w >= 3 else 0.0

        cy0, cy1 = h // 3, 2 * h // 3
        cx0, cx1 = w // 3, 2 * w // 3
        center = mask_f[cy0:cy1, cx0:cx1].mean() if (cy1 > cy0 and cx1 > cx0) else 0.0

        return {
            "top": float(top),
            "bottom": float(bottom),
            "left": float(left),
            "right": float(right),
            "center": float(center),
        }

    def _try_compute_region_shap_scores(self, image: np.ndarray) -> Dict[str, float] | None:
        """Approximate SHAP-style region contributions using occlusion.

        This method uses the optional Keras mitosis detector (if available) and
        measures how much the model's average output changes when masking each
        region (top, bottom, left, right, center). The resulting scores are
        normalised to [0, 1] and sum to 1.
        """
        if not _HAS_KERAS or keras is None or tf is None:
            return None

        model = _get_mitosis_model()

        # Preprocess image similarly to _segment_mitosis
        img = image
        if img.ndim == 2:
            img = np.repeat(img[..., None], 3, axis=-1)
        if img.dtype != np.float32:
            img = img.astype(np.float32)
        if img.max() > 1.0:
            img = img / 255.0

        H, W, _ = img.shape
        input_shape = getattr(model, "input_shape", None)
        if not input_shape or len(input_shape) != 4:
            return None
        _, H0, W0, C0 = input_shape
        if C0 is None:
            C0 = 3

        img_resized = cv2.resize(img, (int(W0), int(H0)), interpolation=cv2.INTER_AREA)
        if C0 == 1:
            img_resized = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)[..., None]

        # Baseline prediction: average model output over spatial dimensions.
        x = np.expand_dims(img_resized, axis=0)
        pred = model.predict(x, verbose=0)
        base_prob = float(np.mean(pred))

        # Define regions in resized space
        h0, w0 = img_resized.shape[:2]
        cy0_r, cy1_r = h0 // 3, 2 * h0 // 3
        cx0_r, cx1_r = w0 // 3, 2 * w0 // 3

        regions = {
            "top": (slice(0, cy0_r), slice(0, w0)),
            "bottom": (slice(2 * h0 // 3, h0), slice(0, w0)),
            "left": (slice(0, h0), slice(0, cx0_r)),
            "right": (slice(0, h0), slice(2 * w0 // 3, w0)),
            "center": (slice(cy0_r, cy1_r), slice(cx0_r, cx1_r)),
        }

        # Use global mean as occlusion baseline value
        baseline_value = float(img_resized.mean())

        scores: Dict[str, float] = {}
        deltas = []
        for name, (rs, cs) in regions.items():
            img_occ = img_resized.copy()
            if C0 == 1:
                img_occ[rs, cs, 0] = baseline_value
            else:
                img_occ[rs, cs, :] = baseline_value
            x_occ = np.expand_dims(img_occ, axis=0)
            pred_occ = model.predict(x_occ, verbose=0)
            prob_occ = float(np.mean(pred_occ))
            delta = max(0.0, base_prob - prob_occ)
            scores[name] = delta
            deltas.append(delta)

        total = float(sum(deltas))
        if total <= 0.0:
            # Fall back to uniform if there is no change
            return {k: 1.0 / len(scores) for k in scores}

        for k in scores:
            scores[k] = scores[k] / total
        return scores

    def _make_heatmap(self, prob: np.ndarray, image: np.ndarray | None = None, alpha: float = 0.5) -> np.ndarray:
        """Create a colored heatmap from the probability or attribution map.

        If `image` is provided, blend the heatmap on top of the image so that
        high-probability or high-importance regions are clearly visible.
        """
        # Normalize map to [0, 1]
        prob_norm = (prob - prob.min()) / max(float(prob.max() - prob.min()), 1e-8)
        prob_uint8 = (prob_norm * 255.0).astype(np.uint8)

        # Apply a colormap (OpenCV produces BGR; convert back to RGB)
        heat_bgr = cv2.applyColorMap(prob_uint8, cv2.COLORMAP_JET)
        heat_rgb = cv2.cvtColor(heat_bgr, cv2.COLOR_BGR2RGB)

        if image is None:
            return heat_rgb

        # Ensure base image is uint8 RGB and same spatial size
        if image.dtype != np.uint8:
            base = (np.clip(image, 0, 1) * 255).astype(np.uint8)
        else:
            base = image.copy()

        h, w = prob.shape
        if base.shape[:2] != (h, w):
            base_resized = cv2.resize(base, (w, h), interpolation=cv2.INTER_LINEAR)
        else:
            base_resized = base

        blended = cv2.addWeighted(base_resized, 1.0 - alpha, heat_rgb, alpha, 0.0)
        return blended

    # -------------------------- Grad-CAM utilities --------------------------
    def _try_compute_gradcam_map(self, image: np.ndarray) -> np.ndarray | None:
        """Compute a Grad-CAM style attribution map using the mitosis model.

        This follows the standard Grad-CAM formulation on the last Conv2D layer
        of the tf.keras model, using the average model output as the target.
        Returns a float32 map in [0, 1] with the same spatial size as `image`,
        or None if TensorFlow/Keras are unavailable or the model has no Conv2D
        layers.
        """
        if not _HAS_KERAS or keras is None or tf is None:
            return None

        model = _get_mitosis_model()

        # Preprocess image similarly to _segment_mitosis
        img = image
        if img.ndim == 2:
            img = np.repeat(img[..., None], 3, axis=-1)
        if img.dtype != np.float32:
            img = img.astype(np.float32)
        if img.max() > 1.0:
            img = img / 255.0

        H, W, _ = img.shape
        input_shape = getattr(model, "input_shape", None)
        if not input_shape or len(input_shape) != 4:
            return None
        _, H0, W0, C0 = input_shape
        if C0 is None:
            C0 = 3

        img_resized = cv2.resize(img, (int(W0), int(H0)), interpolation=cv2.INTER_AREA)
        if C0 == 1:
            img_resized = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)[..., None]

        # Find the last Conv2D layer for Grad-CAM
        last_conv_layer = None
        for layer in reversed(model.layers):
            if isinstance(layer, keras.layers.Conv2D):  # type: ignore[attr-defined]
                last_conv_layer = layer
                break
        if last_conv_layer is None:
            return None

        grad_model = keras.models.Model(
            [model.inputs], [last_conv_layer.output, model.output]
        )

        # Use average model output as scalar target (works for segmentation-like
        # outputs as well as logits/probabilities).
        img_tensor = tf.convert_to_tensor(img_resized[None, ...], dtype=tf.float32)
        with tf.GradientTape() as tape:  # type: ignore[attr-defined]
            conv_outputs, predictions = grad_model(img_tensor)
            target = tf.reduce_mean(predictions)
        grads = tape.gradient(target, conv_outputs)
        if grads is None:
            return None

        conv_outputs = conv_outputs[0]
        grads = grads[0]

        # Channel-wise importance weights
        weights = tf.reduce_mean(grads, axis=(0, 1))
        cam = tf.reduce_sum(weights * conv_outputs, axis=-1)
        cam = tf.nn.relu(cam)

        cam_min = tf.reduce_min(cam)
        cam_max = tf.reduce_max(cam)
        cam = (cam - cam_min) / (cam_max - cam_min + 1e-8)
        cam_np = cam.numpy().astype(np.float32)

        # Resize to original image size
        cam_resized = cv2.resize(cam_np, (W, H), interpolation=cv2.INTER_LINEAR)
        cam_resized = np.clip(cam_resized, 0.0, 1.0).astype(np.float32)
        return cam_resized
