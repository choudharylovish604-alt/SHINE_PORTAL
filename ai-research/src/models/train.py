import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def train_model():
    # 1. Load optimized dataset
    data_path = r"d:\harsh\h\harsh\Shine\ai\data\processed\processed_students.csv"
    if not os.path.exists(data_path):
        print("Error: Processed dataset not found. Run preprocess.py first.")
        return

    df = pd.read_csv(data_path)
    
    # 2. Prepare Features and Target
    X = df.drop(columns=['label'])
    y = df['label']
    
    # Freeze feature list for consistency
    feature_list = X.columns.tolist()
    
    # 3. Stratified Train/Test Split
    # Stratified ensures each set has the same proportion of classes (Safe/Medium/High)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training on {len(X_train)} samples, testing on {len(X_test)} samples.")
    
    # 4. Initialize Random Forest Baseline
    # class_weight='balanced' helps the model learn from the minority 'High Risk' class
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced' 
    )
    
    # 5. Training
    print("Training Random Forest baseline...")
    rf.fit(X_train, y_train)
    
    # 6. Evaluation
    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)
    
    print("\n--- Model Performance ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Safe', 'Medium Risk', 'High Risk']))
    
    # 7. Save Model and Metadata
    model_dir = r"d:\harsh\h\harsh\Shine\ai\models"
    os.makedirs(model_dir, exist_ok=True)
    
    model_data = {
        'model': rf,
        'features': feature_list,
        'classes': ['Safe', 'Medium Risk', 'High Risk']
    }
    
    model_path = os.path.join(model_dir, "rf_baseline.joblib")
    joblib.dump(model_data, model_path)
    
    print(f"\nSuccess! Model saved to {model_path}")
    
    # Return data for external evaluation scripts if needed
    return X_test, y_test, y_pred, rf

if __name__ == "__main__":
    train_model()
