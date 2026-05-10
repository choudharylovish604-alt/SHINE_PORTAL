import pandas as pd
import numpy as np
import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report

def evaluate_model():
    # 1. Load Model and Features
    model_path = r"d:\harsh\h\harsh\Shine\ai\models\rf_baseline.joblib"
    if not os.path.exists(model_path):
        print("Error: Model file not found. Run train.py first.")
        return

    data = joblib.load(model_path)
    model = data['model']
    features = data['features']
    
    # 2. Load Test Data (re-splitting for simplicity in this demo)
    data_path = r"d:\harsh\h\harsh\Shine\ai\data\processed\processed_students.csv"
    df = pd.read_csv(data_path)
    X = df[features]
    y = df['label']
    
    from sklearn.model_selection import train_test_split
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    y_pred = model.predict(X_test)
    
    # 3. Confusion Matrix Visualization
    print("Generating Confusion Matrix...")
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Safe', 'Medium', 'High'], 
                yticklabels=['Safe', 'Medium', 'High'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Random Forest Baseline: Confusion Matrix')
    
    output_plot = r"d:\harsh\h\harsh\Shine\ai\outputs\plots\confusion_matrix.png"
    plt.savefig(output_plot)
    print(f"Confusion Matrix saved to {output_plot}")
    
    # 4. Feature Importance Analysis
    print("\nExtracting Feature Importance...")
    importances = model.feature_importances_
    feat_importances = pd.Series(importances, index=features)
    top_15 = feat_importances.sort_values(ascending=False).head(15)
    
    plt.figure(figsize=(10, 8))
    top_15.plot(kind='barh')
    plt.title('Top 15 Predictors of Student Risk')
    plt.xlabel('Importance Score')
    
    importance_plot = r"d:\harsh\h\harsh\Shine\ai\outputs\plots\feature_importance.png"
    plt.savefig(importance_plot)
    print(f"Feature Importance plot saved to {importance_plot}")
    
    # 5. Output Results
    print("\n--- Detailed Class-Wise Recall ---")
    report = classification_report(y_test, y_pred, target_names=['Safe', 'Medium Risk', 'High Risk'], output_dict=True)
    for cls in ['Safe', 'Medium Risk', 'High Risk']:
        print(f"{cls} Recall: {report[cls]['recall']:.2f}")

if __name__ == "__main__":
    evaluate_model()
