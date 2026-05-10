import pandas as pd
import numpy as np
import os
from labeling import create_risk_labels
from feature_engineering import engineer_features

def run_pipeline():
    # 1. Load Datasets
    raw_path = r"d:\harsh\h\harsh\Shine\ai\data\raw\student"
    mat_df = pd.read_csv(os.path.join(raw_path, "student-mat.csv"), sep=';')
    por_df = pd.read_csv(os.path.join(raw_path, "student-por.csv"), sep=';')
    
    # 2. Merge with Course Identifier
    mat_df['course'] = 'math'
    por_df['course'] = 'portuguese'
    df = pd.concat([mat_df, por_df], axis=0).reset_index(drop=True)
    
    # 3. Label Engineering (Before removing leakage columns as labels need G3)
    print("Creating labels...")
    df = create_risk_labels(df)
    
    # 4. Feature Engineering
    print("Engineering features...")
    df = engineer_features(df)
    
    # 5. Leakage Prevention & Redundancy Removal
    # - Leakage: Grades (G1, G2, G3) contain future info relative to early risk.
    # - Redundancy: Medu, Fedu, Dalc, Walc, and romantic are represented by engineered scores.
    leakage_cols = ['G1', 'G2', 'G3', 'risk_score'] 
    redundant_cols = ['Medu', 'Fedu', 'Dalc', 'Walc', 'romantic']
    drop_cols = leakage_cols + redundant_cols
    
    print(f"Removing columns: {drop_cols}")
    df_clean = df.drop(columns=drop_cols)

    
    # 6. Categorical Encoding
    print("Encoding categorical variables...")
    
    # Identify all categorical columns
    categorical_cols = df_clean.select_dtypes(include=['object']).columns.tolist()
    
    # Separate binary and multiclass for better control
    binary_cols = [col for col in categorical_cols if df_clean[col].nunique() == 2]
    nominal_cols = [col for col in categorical_cols if df_clean[col].nunique() > 2]
    
    print(f"Mapping binary columns: {binary_cols}")
    for col in binary_cols:
        # Sort values to ensure consistent mapping (e.g., 'no' -> 0, 'yes' -> 1)
        unique_vals = sorted(df_clean[col].unique())
        df_clean[col] = df_clean[col].map({unique_vals[0]: 0, unique_vals[1]: 1})

    print(f"One-hot encoding nominal columns: {nominal_cols}")
    df_final = pd.get_dummies(df_clean, columns=nominal_cols, drop_first=True)
    
    # Convert any remaining booleans (from get_dummies) to integers
    for col in df_final.select_dtypes(include=['bool']).columns:
        df_final[col] = df_final[col].astype(int)

    
    # 7. Final Cleanup
    # Ensure all columns are numeric
    non_numeric = df_final.select_dtypes(exclude=[np.number]).columns
    if len(non_numeric) > 0:
        print(f"Warning: Non-numeric columns remaining: {non_numeric}")
        df_final = df_final.drop(columns=non_numeric)
    
    # 8. Export Processed Dataset
    output_path = r"d:\harsh\h\harsh\Shine\ai\data\processed"
    os.makedirs(output_path, exist_ok=True)
    df_final.to_csv(os.path.join(output_path, "processed_students.csv"), index=False)
    
    print(f"Success! Final dataset shape: {df_final.shape}")
    print(f"Class distribution:\n{df_final['label'].value_counts(normalize=True)}")
    print(f"Dataset saved to {output_path}")

if __name__ == "__main__":
    run_pipeline()
