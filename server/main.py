import os
import pickle
import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
from dotenv import load_dotenv

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Load environment variables (.env file)
load_dotenv()

# --- 1. SQLite Database Setup ---
DATABASE_URL = "sqlite:///./server/traffic.db"
# Ensure the server directory exists
os.makedirs("server", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ORM Models
class TrafficLogModel(Base):
    __tablename__ = "traffic_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(String, index=True)
    actual = Column(Integer)
    predicted = Column(Integer)

class ActiveIncidentModel(Base):
    __tablename__ = "active_incidents"
    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    roadId = Column(String)
    roadName = Column(String)
    severity = Column(String)
    description = Column(String)
    timestamp = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 2. FastAPI Setup ---
app = FastAPI(title="MetroFlow AI - Traffic Simulation Backend")

# Enable CORS for the React Dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Machine Learning Model Loading ---
MODEL_PATH = os.path.join("server", "model.pkl")
ml_model = None

if os.path.exists(MODEL_PATH):
    try:
        with open(MODEL_PATH, "rb") as f:
            ml_model = pickle.load(f)
        print(f"[OK] ML Predictor Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"[ERROR] Failed to load ML model: {e}")
else:
    print(f"[WARNING] ML model file {MODEL_PATH} not found. Running server in simulated prediction mode. Run train.py first.")

# --- 4. TomTom API Traffic Fetcher ---
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

# --- 5. Pydantic Schemas for Requests ---
class TrafficLogCreate(BaseModel):
    timestamp: str
    actual: int
    predicted: int

class TrafficLogOut(BaseModel):
    id: int
    timestamp: str
    actual: int
    predicted: int
    class Config:
        from_attributes = True

class IncidentCreate(BaseModel):
    id: str
    type: str
    roadId: str
    roadName: str
    severity: str
    description: str
    timestamp: str

class IncidentOut(BaseModel):
    id: str
    type: str
    roadId: str
    roadName: str
    severity: str
    description: str
    timestamp: str
    class Config:
        from_attributes = True

class PredictionInput(BaseModel):
    weather: int           # 0: sunny, 1: rain, 2: snow
    time_of_day: int       # 0: morning, 1: midday, 2: evening, 3: night
    event: int             # 0: none, 1: sports, 2: concert, 3: holiday
    active_policies: int   # count (0 to 3)
    incidents: int         # count of active incidents

# --- 6. API Endpoints ---

# A. Traffic History Endpoints
@app.get("/api/history", response_model=List[TrafficLogOut])
def get_traffic_history(db: Session = Depends(get_db)):
    # Query last 15 entries sorted by id ascending
    logs = db.query(TrafficLogModel).order_by(TrafficLogModel.id.desc()).limit(15).all()
    return sorted(logs, key=lambda x: x.id)

@app.post("/api/logs", response_model=TrafficLogOut, status_code=status.HTTP_201_CREATED)
def create_traffic_log(log_in: TrafficLogCreate, db: Session = Depends(get_db)):
    db_log = TrafficLogModel(
        timestamp=log_in.timestamp,
        actual=log_in.actual,
        predicted=log_in.predicted
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# B. Incident Management Endpoints
@app.get("/api/incidents", response_model=List[IncidentOut])
def get_active_incidents(db: Session = Depends(get_db)):
    return db.query(ActiveIncidentModel).all()

@app.post("/api/incidents", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def spawn_incident(inc_in: IncidentCreate, db: Session = Depends(get_db)):
    # Check if exists
    exists = db.query(ActiveIncidentModel).filter(ActiveIncidentModel.id == inc_in.id).first()
    if exists:
        return exists
    db_inc = ActiveIncidentModel(
        id=inc_in.id,
        type=inc_in.type,
        roadId=inc_in.roadId,
        roadName=inc_in.roadName,
        severity=inc_in.severity,
        description=inc_in.description,
        timestamp=inc_in.timestamp
    )
    db.add(db_inc)
    db.commit()
    db.refresh(db_inc)
    return db_inc

@app.delete("/api/incidents/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def resolve_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(ActiveIncidentModel).filter(ActiveIncidentModel.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(inc)
    db.commit()
    return None

# C. Machine Learning Prediction Endpoint
@app.post("/api/predict")
def predict_congestion(input_data: PredictionInput):
    # If model is loaded, run real inference
    if ml_model is not None:
        try:
            features = [[
                input_data.weather,
                input_data.time_of_day,
                input_data.event,
                input_data.active_policies,
                input_data.incidents
            ]]
            prediction = ml_model.predict(features)[0]
            return {
                "source": "RandomForestRegressor Model",
                "predicted_congestion": int(round(prediction))
            }
        except Exception as e:
            print(f"ML Inference failed: {e}")
            # Fall back to simulation formula below

    # Fallback/Simulation Formula (if model not trained or fails)
    base = 38
    w_map = {0: 0, 1: 12, 2: 28}
    t_map = {0: 18, 1: 0, 2: 22, 3: -15}
    e_map = {0: 0, 1: 15, 2: 10, 3: -6}
    
    val = base + w_map.get(input_data.weather, 0) + t_map.get(input_data.time_of_day, 0) + e_map.get(input_data.event, 0) - (7.5 * input_data.active_policies) + (18 * input_data.incidents)
    val = max(10, min(98, val))
    
    return {
        "source": "Simulated ML Engine",
        "predicted_congestion": int(round(val))
    }

# D. TomTom Real-Time Traffic Proxy Endpoint
@app.get("/api/tomtom")
def get_tomtom_traffic_flow(style: str = "absolute", zoom: int = 12):
    """
    Fetches real-time traffic flow speed/congestion segment data from the TomTom API
    for a coordinate box near Chennai (13.0827, 80.2707).
    """
    if not TOMTOM_API_KEY:
        return {
            "status": "offline",
            "message": "TomTom API Key not set in environment variables.",
            "data": None
        }
    
    # Coordinate box around Chennai (example segment endpoint)
    # Using Chennai main Central (13.0827, 80.2707)
    point = "13.0827,80.2707"
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/{style}/{zoom}/json"
    params = {
        "key": TOMTOM_API_KEY,
        "point": point,
        "unit": "KMPH"
    }
    
    try:
        resp = requests.get(url, params=params)
        if resp.status_code == 200:
            data = resp.json()
            flow_data = data.get("flowSegmentData", {})
            return {
                "status": "online",
                "message": "Real-world traffic flow fetched successfully",
                "data": {
                    "currentSpeed": flow_data.get("currentSpeed"),
                    "freeFlowSpeed": flow_data.get("freeFlowSpeed"),
                    "congestionIndex": int(round(float(flow_data.get("currentSpeed", 1) / flow_data.get("freeFlowSpeed", 1)) * 100))
                }
            }
        else:
            return {
                "status": "error",
                "message": f"TomTom API returned status code {resp.status_code}",
                "data": None
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to connect to TomTom: {str(e)}",
            "data": None
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
