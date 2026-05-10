import pandas as pd
import numpy as np
import os

def analyze_datasets():
    path = r"d:\harsh\h\harsh\Shine\ai\data\raw\student"
    mat_df = pd.read_csv(os.path.join(path, "student-mat.csv"), sep=';')
    por_df = pd.read_csv(os.path.join(path, "student-por.csv"), sep=';')
    
    # Add course identifier
    mat_df['course'] = 'math'
    por_df['course'] = 'portuguese'
    
    # Merge datasets
    df = pd.concat([mat_df, por_df], axis=0).reset_index(drop=True)
    
    print(f"Shape: {df.shape}")
    print("\nMissing Values Count:")
    print(df.isnull().sum().sum())
    
    print("\nDuplicates Count:")
    print(df.duplicated().sum())
    
    print("\nColumns types:")
    print(df.dtypes.value_counts())
    
    # Analyze categorical vs numerical
    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    num_cols = df.select_dtypes(exclude=['object']).columns.tolist()
    print(f"\nCategorical columns: {cat_cols}")
    print(f"Numerical columns: {num_cols}")
    
    # Feature distributions (summary)
    print("\nNumerical Summary:")
    print(df.describe().to_string())

if __name__ == "__main__":
    analyze_datasets()
