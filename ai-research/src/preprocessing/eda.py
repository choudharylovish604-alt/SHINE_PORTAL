import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import json

def run_eda():
    # Load dataset
    df_path = r"d:\harsh\h\harsh\Shine\ai\data\processed\processed_students.csv"
    df = pd.read_csv(df_path)
    
    # Output directories
    plot_dir = r"d:\harsh\h\harsh\Shine\ai\outputs\plots"
    metric_dir = r"d:\harsh\h\harsh\Shine\ai\outputs\metrics"
    os.makedirs(plot_dir, exist_ok=True)
    os.makedirs(metric_dir, exist_ok=True)
    
    summary = {}
    
    # 1. Class Distribution Analysis
    print("Analyzing class distribution...")
    class_counts = df['label'].value_counts()
    class_pct = df['label'].value_counts(normalize=True)
    summary['class_distribution'] = class_pct.to_dict()
    
    plt.figure(figsize=(8, 6))
    sns.countplot(x='label', data=df, palette='viridis')
    plt.title('Distribution of Student Risk Labels (0=Safe, 1=Medium, 2=High)')
    plt.savefig(os.path.join(plot_dir, 'class_distribution.png'))
    plt.close()
    
    # 2. Correlation Analysis
    print("Analyzing correlations...")
    corr = df.corr()
    
    # Get top correlations with label
    label_corr = corr['label'].sort_values(ascending=False)
    summary['top_positive_correlations'] = label_corr.head(10).to_dict()
    summary['top_negative_correlations'] = label_corr.tail(10).to_dict()
    
    plt.figure(figsize=(15, 12))
    sns.heatmap(corr, cmap='RdBu_r', center=0, annot=False)
    plt.title('Feature Correlation Heatmap')
    plt.savefig(os.path.join(plot_dir, 'correlation_heatmap.png'))
    plt.close()
    
    # 3. Feature vs Risk Analysis (Key Predictors)
    print("Analyzing feature vs risk...")
    top_features = ['absences', 'failures', 'lifestyle_risk_score', 'family_support_score', 'study_to_social_ratio']
    
    for feat in top_features:
        plt.figure(figsize=(10, 6))
        sns.boxplot(x='label', y=feat, data=df, palette='magma')
        plt.title(f'{feat} vs Risk Level')
        plt.savefig(os.path.join(plot_dir, f'risk_vs_{feat}.png'))
        plt.close()
        
    # 4. Outlier Detection (Absences)
    print("Detecting outliers...")
    summary['absences_stats'] = df['absences'].describe().to_dict()
    
    # 5. Redundant Feature Detection
    # Highly correlated pairs (> 0.8)
    high_corr_pairs = []
    for i in range(len(corr.columns)):
        for j in range(i):
            if abs(corr.iloc[i, j]) > 0.8:
                high_corr_pairs.append((corr.columns[i], corr.columns[j], corr.iloc[i, j]))
    summary['high_correlation_pairs'] = high_corr_pairs

    # Save summary
    with open(os.path.join(metric_dir, 'eda_summary.json'), 'w') as f:
        json.dump(summary, f, indent=4)
    
    print(f"EDA Complete. Results saved to {plot_dir} and {metric_dir}")

if __name__ == "__main__":
    run_eda()
