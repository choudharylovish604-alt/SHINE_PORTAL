import pandas as pd
import numpy as np

def engineer_features(df):
    """
    Generates high-value engineered features for student dropout prediction.
    Focuses on social, lifestyle, and academic behavioral signals.
    """
    
    # 1. Family Support Score
    # Combines parental education and support systems
    # Medu/Fedu are 0-4
    df['family_support_score'] = (df['Medu'] + df['Fedu'] + 
                                 df['famsup'].map({'yes': 1, 'no': 0}) + 
                                 df['internet'].map({'yes': 1, 'no': 0})) / 10
    
    # 2. Lifestyle Risk Score
    # Combines alcohol consumption and going out
    # Dalc/Walc are 1-5, goout is 1-5
    df['lifestyle_risk_score'] = (df['Dalc'] + df['Walc'] + df['goout']) / 15
    
    # 3. Academic Load vs Support
    # Higher education ambition vs current school support
    df['academic_ambition_gap'] = df['higher'].map({'yes': 1, 'no': 0}) - df['schoolsup'].map({'yes': 1, 'no': 0})
    
    # 4. Social Engagement Indicators
    # Romantic relationships and activities can be both positive and negative
    df['social_distraction_score'] = (df['romantic'].map({'yes': 1, 'no': 0}) + 
                                     df['freetime'] / 5)
    
    # 5. Parental Education Influence
    # Captures if parents have higher education (>= degree level)
    df['highly_educated_parents'] = ((df['Medu'] >= 3) | (df['Fedu'] >= 3)).astype(int)
    
    # 6. Study Efficiency Proxy (Realistic early signal)
    # How much they study vs how much they go out
    df['study_to_social_ratio'] = df['studytime'] / (df['goout'] + 1e-5)
    
    # 7. Behavioral Risk Signal
    # High absences + Low study time
    df['behavioral_warning'] = ((df['absences'] > df['absences'].median()) & 
                                (df['studytime'] <= 2)).astype(int)

    return df
