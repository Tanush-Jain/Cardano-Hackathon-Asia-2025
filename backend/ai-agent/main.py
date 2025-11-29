from fastapi import FastAPI
from pydantic import BaseModel
from typing import Union, Optional
from datetime import datetime
import os
import json

class ProofIn(BaseModel):
    proof: str
    signature: Union[dict, str]
    address: Optional[str] = None

app = FastAPI(title="AI Agent API")

# simple health check
@app.get("/health")
async def health():
    return {"status": "ok", "ts": datetime.utcnow().isoformat()}

# store incoming proofs for audit
STORAGE = os.path.join(os.path.dirname(__file__), "proofs")
os.makedirs(STORAGE, exist_ok=True)

@app.post("/api/verify-proof")
async def verify_proof(data: ProofIn):
    fname = f"proof_{int(datetime.utcnow().timestamp())}.json"
    path = os.path.join(STORAGE, fname)
    with open(path, "w") as f:
        json.dump(data.dict(), f, indent=2, default=str)
    # TODO: implement cryptographic verification separately
    return {"ok": True, "stored_file": fname}