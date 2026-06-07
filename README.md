# ❤️ Heart Disease Analysis System 🫀

A full-stack web application for **heart-disease risk prediction** using a **FastAPI** backend ⚡ and a **React + Vite + Tailwind CSS** frontend 🎨.  
The backend runs **SVM model inference** 🤖 on 13 clinical input features and returns a clear **risk tier** plus **hospitalization guidance** 🏥✅.

> ℹ️ Note: No `README.md` was found in the repository at the time of analysis.

---

## ✨ Features

- 🧭 **React SPA** with route-based pages:
  - 🏠 Home (`/`)
  - 📊 Predict (`/predict`)
  - ℹ️ About (`/about`)
- 🚀 **FastAPI REST API** with CORS support
- 🧠 **Prediction endpoint** that returns:
  - ✅ Presence/Absence classification
  - 🚦 Risk level guidance text
  - 📈 Confidence/decision score
  - 🏥 Hospitalization recommendation flag + note

---

## 🧰 Tech Stack

### 🎨 Frontend
- ⚛️ React 18
- 🧭 React Router DOM
- ⚡ Vite
- 💨 Tailwind CSS

Frontend dev server runs on **port 5173** 🔌.

### ⚙️ Backend
- ⚡ FastAPI
- 🧾 Pydantic schemas for validation
- 🐼 Pandas for preprocessing
- 📦 Joblib for loading persisted ML artifacts (SVM model + scaler + expected columns)

---

## 🗂️ Repository Structure

```text
.
├── backend/
│   ├── app.py
│   ├── predictor.py
│   ├── schemas.py
│   ├── __init__.py
│   └── .gitignore
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .gitignore
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── PredictPage.jsx
            └── AboutPage.jsx
```

---

## 🔌 Backend API

### 🌐 Base URL
By default you’ll run the API locally: `http://127.0.0.1:8000`

### 🧩 Endpoints

- `GET /` ✅  
  Returns a simple message to confirm the API is running.

- `GET /health` 🩺  
  Returns "ok" if model assets were loaded, otherwise "degraded".

- `POST /predict` 📩  
  Accepts a JSON payload of patient clinical values and returns prediction + guidance.

---

## 🧾 Input Schema (Predict Request)

`POST /predict` expects the following fields 🧑‍⚕️:

| Field | Type |
|------|------|
| Age | int |
| Sex | int |
| Chest_pain_type | int |
| BP | int |
| Cholesterol | int |
| FBS_over_120 | int |
| EKG_results | int |
| Max_HR | int |
| Exercise_angina | int |
| ST_depression | float |
| Slope_of_ST | int |
| Number_of_vessels_fluro | int |
| Thallium | int |
|
✅ Example request:

```json
{
  "Age": 55,
  "Sex": 1,
  "Chest_pain_type": 3,
  "BP": 130,
  "Cholesterol": 250,
  "FBS_over_120": 0,
  "EKG_results": 1,
  "Max_HR": 150,
  "Exercise_angina": 0,
  "ST_depression": 1.2,
  "Slope_of_ST": 2,
  "Number_of_vessels_fluro": 0,
  "Thallium": 7
}
```

📤 Example response (shape):

```json
{
  "prediction": "Presence",
  "risk_level": "High Risk. Consult a doctor immediately and go under medication.",
  "confidence_score": 0.92,
  "hospitalization_required": false,
  "hospitalization_note": "No immediate hospitalization required"
}
```

---

## 📦 Model Artifacts (Required)

The backend loads these files from the `backend/` directory 🗃️:

- `best_heart_model_svm.joblib` 🤖
- `heart_scaler.joblib` 📏
- `heart_model_columns.joblib` 🧩

If these files are missing or fail to load, the API will run in a **degraded** state ⚠️ and `POST /predict` will return an error ❌.

> ⚠️ During analysis, no `.joblib` files were found in the repository under `backend/`. Ensure they are present before running inference.

---

## 🏃‍♀️ Running the Project (Local Development)

### 1) ⚙️ Start the Backend (FastAPI)

From the repository root:

```bash
cd backend
```

Install dependencies 📥 (you may need to create a `requirements.txt` or install manually since none was found):

```bash
pip install fastapi uvicorn joblib pandas pydantic
```

Run the API 🚀:

```bash
uvicorn app:app --reload --port 8000
```
or .... python -m uvicorn app:app --reload

Test ✅:

- `GET http://127.0.0.1:8000/`
- `GET http://127.0.0.1:8000/health`

#### 🌍 CORS / Allowed Origins

The backend reads an environment variable:

- `ALLOWED_ORIGINS` (default: `*`) 🔓

Example:

```bash
export ALLOWED_ORIGINS=http://localhost:5173
```

---

### 2) 🎨 Start the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Then open 🌐:
- `http://localhost:5173`

---

## 🤝 Contributing (Open for Contributions)

Contributions are welcome! 🎉 If you’d like to improve UI/UX, add validation, deploy scripts, tests, or include the missing model artifacts setup, feel free to contribute.

### ✅ How to contribute
1. 🍴 Fork this repository
2. 🌿 Create a new branch:
   ```bash
    git checkout -b feature/your-feature-name
    ```
3. 🛠️ Make your changes
4. ✅ Commit with a clear message:
   ```bash
    git commit -m "Add: <short description>"
   ```
5. 📤 Push to your fork:
   ```bash
    git push origin feature/your-feature-name
    ```

6. 🔁 Open a Pull Request (PR)

### 💡 Suggested improvements
- 🧾 Add `backend/requirements.txt`
- 📦 Add/Document model artifact generation + placement
- 🧪 Add API and frontend tests
- 🐳 Add Docker / docker-compose for one-command startup
- 🔐 Add environment-based API base URL config for frontend

---

## 👩‍💻 Author

- **Snigdha Datta** (GitHub: `@SnigdhaDatta`) ✨


---

## ⚠️ Disclaimer

This project is for educational/demo purposes only 🎓 and **not a substitute for professional medical advice** 🩺.  
Always consult qualified healthcare professionals for clinical decisions ✅.
