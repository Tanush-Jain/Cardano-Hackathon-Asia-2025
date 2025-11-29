import axios from 'axios'

const BACKEND_URL = 'http://127.0.0.1:8000'

export interface AnalysisResult {
  diagnosis: string
  confidence: number
  original_image: string
  segmentation_mask: string
  grad_cam_heatmap: string
  shap_values: Record<string, number>
  midnight_proof_hash: string
}

export async function uploadToAgent(file: File): Promise<AnalysisResult> {
  console.log('🚀 Uploading:', file.name)
  
  const base64 = await fileToBase64(file)
  
  const response = await axios.post<AnalysisResult>(`${BACKEND_URL}/job`, {
    image_base64: base64,
    patient_id: `patient-${Date.now()}`
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-masumi-payment-tx': `tx-${Date.now()}`
    },
    timeout: 120000
  })
  
  console.log('✅ Got result:', response.data.diagnosis)
  return response.data
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function checkBackendHealth() {
  try {
    const res = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 })
    return res.data.ai_available
  } catch {
    return false
  }
}