from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
try:
    # Works when executed as package module: backend.app:app
    from .predictor import HeartPredictor
    from .schemas import PatientData
except ImportError:
    # Works when executed from backend directory: app:app
    from predictor import HeartPredictor
    from schemas import PatientData


app = FastAPI(title="Heart Disease Monitoring API (SVM)")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    predictor = HeartPredictor()
except Exception as exc:
    predictor = None
    load_error = str(exc)
else:
    load_error = None


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Heart Disease Monitoring API is running."}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok" if predictor is not None else "degraded"}


@app.post("/predict")
def predict(data: PatientData) -> dict[str, float | int | str | bool]:
    if predictor is None:
        raise HTTPException(status_code=500, detail=f"Error loading model assets: {load_error}")

    return predictor.predict(data.model_dump())








# ================= NODEMCU URL =================

NODEMCU_URL = "http://10.199.195.138/data"

# ================= AUTO PREDICTION =================

@app.get("/auto-predict")
def auto_predict():
    if predictor is None:
        raise HTTPException(status_code=500, detail=f"Model not loaded: {load_error}")

    try:
        response = requests.get(NODEMCU_URL, timeout=20)
        sensor = response.json()
    except Exception:
        return {
            "sensor_data": {},
            "prediction": {
                "prediction": "Sensor Offline",
                "risk_level": "No Data",
                "confidence_score": 0,
                "hospitalization_required": False,
                "hospitalization_note": "Cannot reach sensor device"
            }
        }

    heart_rate = float(sensor.get("heart_rate", 0))
    spo2 = float(sensor.get("spo2", 0))

    if heart_rate < 40 or spo2 < 70:
        return {
            "sensor_data": sensor,
            "prediction": {
                "prediction": "Invalid Reading",
                "risk_level": "Please put finger on sensor",
                "confidence_score": 0,
                "hospitalization_required": False,
                "hospitalization_note": "Place finger properly on sensor"
            }
        }

    payload = {
        "Age": 22,
        "Sex": 0,
        "Chest_pain_type": 2,
        "BP": 110,
        "Cholesterol":180 ,
        "FBS_over_120": 80, 
        "EKG_results": 1, #ectrocardiogram to detect heart attack, irregular heartbeat, and other heart conditions
        "Max_HR": heart_rate,
        "Exercise_angina": 0,
        "ST_depression": 0.0,
        "Slope_of_ST": 0,
        "Number_of_vessels_fluro": 0,
        "Thallium": 1
    }

    result = predictor.predict(payload)

    return {
        "sensor_data": sensor,
        "prediction": result
    }