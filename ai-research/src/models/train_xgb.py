import pandas as pd
import numpy as np
import os
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def train_xgb():
    # 1. Load optimized dataset
    data_path = r"d:\harsh\h\harsh\Shine\ai\data\processed\processed_students.csv"
    if not os.path.exists(data_path):
        print("Error: Processed dataset not found.")
        return

    df = pd.read_csv(data_path)
    X = df.drop(columns=['label'])
    y = df['label']
    feature_list = X.columns.tolist()
    
    # 2. Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 3. Lightweight Hyperparameter Tuning
    # We use a very small grid to keep it laptop-friendly
    print("Starting lightweight XGBoost tuning...")
    
    # Calculate scale_pos_weight for imbalance is tricky in multiclass.
    # Instead, we use 'sample_weight' or just boosting's natural handling.
    # For simplicity and efficiency, we'll tune a few key params.
    
    xgb_model = XGBClassifier(
        objective='multi:softprob',
        num_class=3,
        random_state=42,
        eval_metric='mlogloss',
        # Prevent overfitting on small dataset
        subsample=0.8,
        colsample_bytree=0.8
    )
    
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [3, 5],
        'learning_rate': [0.05, 0.1]
    }
    
    # Small grid search (8 combinations total)
    grid = GridSearchCV(xgb_model, param_grid, cv=3, scoring='f1_macro', n_jobs=-1)
    grid.fit(X_train, y_train)
    
    best_model = grid.best_estimator_
    print(f"Best Params: {grid.best_params_}")
    
    # 4. Evaluation
    y_pred = best_model.predict(X_test)
    
    print("\n--- XGBoost Model Performance ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Safe', 'Medium Risk', 'High Risk']))
    
    # 5. Save Model
    model_dir = r"d:\harsh\h\harsh\Shine\ai\models"
    os.makedirs(model_dir, exist_ok=True)
    
    model_data = {
        'model': best_model,
        'features': feature_list,
        'classes': ['Safe', 'Medium Risk', 'High Risk'],
        'params': grid.best_params_
    }
    
    model_path = os.path.join(model_dir, "xgb_model.joblib")
    joblib.dump(model_data, model_path)
    print(f"\nModel saved to {model_path}")
    
    # Comparison Hint
    print("\nNote: Compare High Risk recall with the Random Forest baseline (0.67).")

if __name__ == "__main__":
    train_xgb()
