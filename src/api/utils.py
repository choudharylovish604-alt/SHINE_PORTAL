import pandas as pd
import numpy as np

def preprocess_input(data_dict, frozen_features):
    """
    Transforms raw JSON input into the exact feature format the model expects.
    Replicates the logic from feature_engineering.py and preprocess.py.
    """
    df = pd.DataFrame([data_dict])
    
    # 1. Feature Engineering
    df['family_support_score'] = (df['Medu'] + df['Fedu'] + 
                                 df['famsup'].map({'yes': 1, 'no': 0}) + 
                                 df['internet'].map({'yes': 1, 'no': 0})) / 10
    
    df['lifestyle_risk_score'] = (df['Dalc'] + df['Walc'] + df['goout']) / 15
    
    df['academic_ambition_gap'] = df['higher'].map({'yes': 1, 'no': 0}) - df['schoolsup'].map({'yes': 1, 'no': 0})
    
    df['social_distraction_score'] = (df['romantic'].map({'yes': 1, 'no': 0}) + 
                                     df['freetime'] / 5)
    
    df['highly_educated_parents'] = ((df['Medu'] >= 3) | (df['Fedu'] >= 3)).astype(int)
    
    df['study_to_social_ratio'] = df['studytime'] / (df['goout'] + 1e-5)
    
    df['behavioral_warning'] = ((df['absences'] > 4) & # Using median from training (approx 4)
                                (df['studytime'] <= 2)).astype(int)

    # 2. Redundancy Removal (Matching option B)
    redundant_cols = ['Medu', 'Fedu', 'Dalc', 'Walc', 'romantic']
    df = df.drop(columns=redundant_cols)
    
    # 3. Categorical Encoding (Binary)
    binary_maps = {
        'school': {'GP': 0, 'MS': 1},
        'sex': {'F': 0, 'M': 1},
        'address': {'R': 0, 'U': 1},
        'famsize': {'GT3': 0, 'LE3': 1},
        'Pstatus': {'A': 0, 'T': 1},
        'schoolsup': {'no': 0, 'yes': 1},
        'famsup': {'no': 0, 'yes': 1},
        'paid': {'no': 0, 'yes': 1},
        'activities': {'no': 0, 'yes': 1},
        'nursery': {'no': 0, 'yes': 1},
        'higher': {'no': 0, 'yes': 1},
        'internet': {'no': 0, 'yes': 1},
        'course': {'math': 0, 'portuguese': 1}
    }
    
    for col, mapping in binary_maps.items():
        if col in df.columns:
            df[col] = df[col].map(mapping)

    # 4. One-Hot Encoding (Nominal)
    # We must ensure all columns from training exist, filling missing with 0
    nominal_cols = ['Mjob', 'Fjob', 'reason', 'guardian']
    df_encoded = pd.get_dummies(df, columns=nominal_cols)
    
    # 5. Reindexing to match Frozen Features
    # This is critical for model consistency
    # Any columns created by get_dummies that weren't in training will be dropped
    # Any columns missing will be filled with 0
    df_final = df_encoded.reindex(columns=frozen_features, fill_value=0)
    
    # Convert bools to int (from get_dummies)
    for col in df_final.select_dtypes(include=['bool']).columns:
        df_final[col] = df_final[col].astype(int)
        
    return df_final
