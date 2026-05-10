import pandas as pd
import numpy as np
import os
import joblib
import shap
import matplotlib.pyplot as plt

def generate_explanations():
    # 1. Load Model
    model_path = r"d:\harsh\h\harsh\Shine\ai\models\xgb_model.joblib"
    if not os.path.exists(model_path):
        print("Error: XGBoost model not found.")
        return

    data = joblib.load(model_path)
    model = data['model']
    features = data['features']
    
    # 2. Load Data for Explanations
    data_path = r"d:\harsh\h\harsh\Shine\ai\data\processed\processed_students.csv"
    df = pd.read_csv(data_path)
    X = df[features]
    
    # 3. Lightweight SHAP Calculation
    # We only use a background sample and a few test samples to keep it fast
    print("Computing lightweight SHAP values...")
    
    # Background dataset (mean of training data is a good neutral reference)
    background = shap.sample(X, 50) 
    
    # TreeExplainer is very fast for XGBoost
    explainer = shap.TreeExplainer(model)
    
    # Explain a few interesting samples (e.g., first 20)
    test_samples = X.iloc[:20]
    shap_values = explainer.shap_values(test_samples)

    # In multiclass XGBoost, SHAP values often come in shape (samples, features, classes)
    # or (classes, samples, features) depending on the explainer version.
    # Let's convert to a consistent format if needed.
    if isinstance(shap_values, list):
        # Already a list of [samples, features] per class
        class_2_shap = shap_values[2]
    elif len(shap_values.shape) == 3:
        # Shape is (samples, features, classes) - standard for newer TreeExplainer
        class_2_shap = shap_values[:, :, 2]
    else:
        class_2_shap = shap_values

    plt.figure(figsize=(10, 8))
    shap.summary_plot(class_2_shap, test_samples, show=False)

    plt.title("SHAP Feature Importance for High Risk Prediction")
    
    plot_path = r"d:\harsh\h\harsh\Shine\ai\outputs\plots\shap_summary.png"
    plt.savefig(plot_path, bbox_inches='tight')
    print(f"Global SHAP plot saved to {plot_path}")
    
    # 5. Local Explanation Function (For Mentors)
    def explain_student(student_idx):
        # Get shap values for this student and High Risk class
        if isinstance(shap_values, list):
            sample_shap = shap_values[2][student_idx]
        elif len(shap_values.shape) == 3:
            sample_shap = shap_values[student_idx, :, 2]
        else:
            sample_shap = shap_values[student_idx]
        
        # Get top 3 positive contributors to risk
        top_indices = np.argsort(sample_shap)[-3:][::-1]
        
        print(f"\n--- Risk Analysis for Student Index {student_idx} ---")
        print("Top Risk Drivers:")
        for idx in top_indices:
            val = sample_shap[idx]
            if val > 0:
                print(f"- {features[idx]}: Increase in risk signal")
                
    # Explain a high risk student if found in sample
    # (Just showing the logic for the first sample)
    explain_student(0)

if __name__ == "__main__":
    generate_explanations()
