from pydantic import BaseModel, Field
from typing import List, Dict

class StudentData(BaseModel):
    # Demographics
    school: str = Field(..., description="Student's school (GP or MS)")
    sex: str = Field(..., description="Student's sex (F or M)")
    age: int = Field(..., ge=15, le=22)
    address: str = Field(..., description="Address type (U or R)")
    famsize: str = Field(..., description="Family size (LE3 or GT3)")
    Pstatus: str = Field(..., description="Parent's cohabitation status (T or A)")
    
    # Parents
    Medu: int = Field(..., ge=0, le=4)
    Fedu: int = Field(..., ge=0, le=4)
    Mjob: str
    Fjob: str
    reason: str
    guardian: str
    
    # School Info
    traveltime: int = Field(..., ge=1, le=4)
    studytime: int = Field(..., ge=1, le=4)
    failures: int = Field(..., ge=0, le=3)
    schoolsup: str
    famsup: str
    paid: str
    activities: str
    nursery: str
    higher: str
    internet: str
    romantic: str
    
    # Lifestyle
    famrel: int = Field(..., ge=1, le=5)
    freetime: int = Field(..., ge=1, le=5)
    goout: int = Field(..., ge=1, le=5)
    Dalc: int = Field(..., ge=1, le=5)
    Walc: int = Field(..., ge=1, le=5)
    health: int = Field(..., ge=1, le=5)
    absences: int = Field(..., ge=0, le=93)
    
    # Metadata
    course: str = Field(..., description="Course name (math or portuguese)")

class PredictionResponse(BaseModel):
    risk_level: int = Field(..., description="0=Safe, 1=Medium, 2=High")
    risk_label: str = Field(..., description="Human readable label")
    confidence: float
    probabilities: Dict[str, float]
    explanation: List[str]
