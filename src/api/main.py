import os
import joblib
import shap
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Body
from typing import List
try:
    from schema import StudentData, PredictionResponse
    from utils import preprocess_input
except ImportError:
    from .schema import StudentData, PredictionResponse
    from .utils import preprocess_input

app = FastAPI(title="Shine AI Inference Service")

# 1. Load Model and Metadata
MODEL_PATH = r"d:\harsh\h\harsh\Shine\ai\models\xgb_model.joblib"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model not found at {MODEL_PATH}")

model_data = joblib.load(MODEL_PATH)
model = model_data['model']
frozen_features = model_data['features']
class_labels = model_data['classes']

# 2. Initialize SHAP Explainer
# TreeExplainer is fast and can be kept in memory
explainer = shap.TreeExplainer(model)

@app.get("/health")
def health_check():
    return {"status": "online", "model": "xgb_v1"}

@app.post("/predict", response_model=PredictionResponse)
def predict(student: StudentData):
    try:
        # Convert Pydantic model to dict
        raw_data = student.dict()
        
        # Preprocess
        X_processed = preprocess_input(raw_data, frozen_features)
        
        # Inference
        probs = model.predict_proba(X_processed)[0]
        prediction = int(np.argmax(probs))
        confidence = float(np.max(probs))
        
        # SHAP Explanation
        # We explain the specific class predicted (or high risk class)
        # For simplicity, we'll explain the predicted class
        shap_vals = explainer.shap_values(X_processed)
        
        # Handle SHAP output format (multiclass)
        if isinstance(shap_vals, list):
            sample_shap = shap_vals[prediction][0]
        elif len(shap_vals.shape) == 3:
            sample_shap = shap_vals[0, :, prediction]
        else:
            sample_shap = shap_vals[0]
            
        # Extract top 3 drivers
        top_indices = np.argsort(sample_shap)[-3:][::-1]
        explanation_factors = [
            f"{frozen_features[i]}: Positive impact on risk prediction" 
            for i in top_indices if sample_shap[i] > 0
        ]
        
        return {
            "risk_level": prediction,
            "risk_label": class_labels[prediction],
            "confidence": round(confidence, 4),
            "probabilities": {
                class_labels[i]: round(float(probs[i]), 4) 
                for i in range(len(class_labels))
            },
            "explanation": explanation_factors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-predict", response_model=List[PredictionResponse])
def batch_predict(students: List[StudentData]):
    results = []
    try:
        # Preprocess all students
        for student in students:
            raw_data = student.dict()
            X_processed = preprocess_input(raw_data, frozen_features)
            
            # Inference
            probs = model.predict_proba(X_processed)[0]
            prediction = int(np.argmax(probs))
            confidence = float(np.max(probs))
            
            # SHAP Explanation (Lightweight)
            shap_vals = explainer.shap_values(X_processed)
            if isinstance(shap_vals, list):
                sample_shap = shap_vals[prediction][0]
            elif len(shap_vals.shape) == 3:
                sample_shap = shap_vals[0, :, prediction]
            else:
                sample_shap = shap_vals[0]
                
            top_indices = np.argsort(sample_shap)[-2:][::-1] # Just top 2 for speed in batch
            explanation_factors = [
                f"{frozen_features[i]}" for i in top_indices if sample_shap[i] > 0
            ]
            
            results.append({
                "risk_level": prediction,
                "risk_label": class_labels[prediction],
                "confidence": round(confidence, 4),
                "probabilities": {
                    class_labels[i]: round(float(probs[i]), 4) 
                    for i in range(len(class_labels))
                },
                "explanation": explanation_factors
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
