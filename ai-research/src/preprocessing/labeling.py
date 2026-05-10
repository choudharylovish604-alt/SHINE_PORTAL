import pandas as pd
import numpy as np

def create_risk_labels(df):
    """
    Creates a production-quality multiclass labeling strategy for student risk.
    0 = Safe, 1 = Medium Risk, 2 = High Risk
    
    Logic:
    Risk is not just G3 (final grade). It is a combination of:
    - Academic performance (G3)
    - Past history (failures)
    - Engagement (absences)
    - Effort (studytime)
    """
    
    # 1. Normalize components to 0-1 scale for scoring
    # G3 is out of 20. We want high risk for LOW G3.
    g3_score = (20 - df['G3']) / 20
    
    # Failures is 0-3. High failures = high risk.
    failure_score = df['failures'] / 3
    
    # Absences - Cap at 30 for normalization to avoid outlier distortion
    absences_clipped = df['absences'].clip(upper=30)
    absence_score = absences_clipped / 30
    
    # Studytime is 1-4. Low studytime = high risk.
    # 1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h
    # Invert it: (4 - studytime) / 3
    study_score = (4 - df['studytime']) / 3
    
    # 2. Weighted Score Calculation
    # Weights: G3 (40%), Failures (30%), Absences (20%), Studytime (10%)
    # This reflects that while grades are the primary indicator, behavior (absences)
    # and past history (failures) are critical early warning signals.
    risk_score = (
        (g3_score * 0.45) + 
        (failure_score * 0.30) + 
        (absence_score * 0.15) + 
        (study_score * 0.10)
    )
    
    # 3. Binning into Classes
    # We want a distribution that reflects a typical educational environment:
    # Most students are safe, some are at risk, few are high risk.
    # Thresholds:
    # 0 - 0.35: Safe (0)
    # 0.35 - 0.60: Medium Risk (1)
    # > 0.60: High Risk (2)
    
    conditions = [
        (risk_score <= 0.35),
        (risk_score > 0.35) & (risk_score <= 0.60),
        (risk_score > 0.60)
    ]
    choices = [0, 1, 2]
    
    df['risk_score'] = risk_score
    df['label'] = np.select(conditions, choices, default=1)
    
    return df

if __name__ == "__main__":
    # Test logic if run standalone
    print("Labeling logic initialized.")
