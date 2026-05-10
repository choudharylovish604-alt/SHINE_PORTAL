# Shine AI - ML Research Workspace

This workspace is dedicated to the Research and Development of the Student Dropout Prediction model. It follows a production-oriented structure to ensure scalability and easy integration with the existing Node.js/React stack via FastAPI.

## 📁 Project Structure

| Folder | Purpose |
| :--- | :--- |
| `data/raw/` | Immutable raw data as received from sources (SQLite/CSV). |
| `data/processed/` | Final cleaned and feature-engineered datasets ready for training. |
| `notebooks/` | Jupyter notebooks for Exploratory Data Analysis (EDA) and prototyping. |
| `src/preprocessing/` | Python scripts for data cleaning, feature engineering, and scaling. |
| `src/models/` | Core logic for model training, hyperparameter tuning (XGBoost/RandomForest). |
| `src/evaluation/` | Scripts for calculating metrics and generating XAI (SHAP/Lime) reports. |
| `src/api/` | FastAPI implementation for serving the model to the backend. |
| `models/` | Serialized model files (`.joblib`, `.json`) ready for production. |
| `outputs/` | Logs, metrics (JSON), and visual plots (confusion matrices, SHAP plots). |

## 🛠️ Environment Setup

### Recommended Setup: Python `venv`
We recommend using a dedicated virtual environment to avoid dependency conflicts.

1. **Create Environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate Environment:**
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Future Roadmap
1. **Experimentation:** Use notebooks to find the best features.
2. **Modularization:** Move stable code from notebooks to `src/`.
3. **Training:** Run `src/models/train.py` to save the best model to `models/`.
4. **Integration:** Launch FastAPI in `src/api/` to provide a REST endpoint for the Node.js backend.
