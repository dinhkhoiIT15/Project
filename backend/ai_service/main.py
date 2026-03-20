from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import onnxruntime as ort
from transformers import BertTokenizer
import numpy as np
import os

app = FastAPI()

# Path to the exported ONNX directory
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ai/bert_onnx_model'))
MODEL_PATH = os.path.join(MODEL_DIR, 'model.onnx')

tokenizer = None
ort_session = None

def softmax(x):
    """Manual Softmax function using Numpy (replaces PyTorch)"""
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)

@app.on_event("startup")
async def startup_event():
    global tokenizer, ort_session
    print("🚀 Starting AI Microservice...")
    try:
        # Load Tokenizer and ONNX Model (Ultra-fast load time)
        tokenizer = BertTokenizer.from_pretrained(MODEL_DIR)
        ort_session = ort.InferenceSession(MODEL_PATH)
        print("✅ ONNX Model loaded successfully and is ready!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")

class ReviewRequest(BaseModel):
    content: str

@app.post("/predict")
async def predict(request: ReviewRequest):
    if not ort_session or not tokenizer:
        raise HTTPException(status_code=503, detail="Model is loading or failed to load")
    
    try:
        # 1. Encode text to Numpy array (No PyTorch Tensors)
        inputs = tokenizer(request.content, return_tensors="np", truncation=True, padding=True, max_length=128)
        
        # 2. Prepare ONNX inputs (Force cast to int64 for Windows compatibility)
        ort_inputs = {
            k: v.astype(np.int64) for k, v in inputs.items()
        }
        
        # 3. Run ONNX Runtime prediction (Blazing fast)
        ort_outs = ort_session.run(None, ort_inputs)
        logits = ort_outs[0]
        
        # 4. Calculate probabilities
        probabilities = softmax(logits)[0]
        
        return {
            "real_prob": float(probabilities[0]),
            "fake_prob": float(probabilities[1]),
            "fake_score": float(probabilities[1]) * 100 # 100-point scale
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))