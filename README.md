---
title: TemporalGNN Disaster Cascade Prediction
emoji: 🌪️
colorFrom: red
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# TemporalGNN Disaster Cascade Prediction

An end-to-end full-stack solution for predicting disaster cascade links between historical disaster events using a trained **Temporal Graph Neural Network (`TemporalGNN`)**. Includes a FastAPI backend microservice and a React + Vite dashboard.

---

## 📌 Model Constraints & Supported Inputs
- **Known Nodes Only**: The model operates strictly over the **1,970 disaster event nodes** present in the training graph.
- **Known Relations**: The model supports **11 cascade relation types**:
  - `CausalRelation`
  - `EnhancingRelation`
  - `HomologyRelation`
  - `Spatial_Adjacent`
  - `Spatial_Direction`
  - `Spatial_Distance`
  - `SubordinateRelation`
  - `Temporal_CoStarting`
  - `Temporal_Connect`
  - `Temporal_Disjoint`
  - `no_cascade`
- Any unknown `src_id`, `dst_id`, or `relation` will return a `400 Bad Request`.

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status |
| `POST` | `/predict` | Predict link probability and cascade verdict |
| `GET` | `/nodes` | List all 1,970 supported disaster node IDs |
| `GET` | `/relations` | List all 11 supported relation types |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## 🖥️ Running the React Frontend

The frontend is located in `frontend/` and communicates with the backend API via `VITE_API_URL`.

### 1. Local Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Environment Variables
- `VITE_API_URL`: Base URL of the FastAPI backend (defaults to `https://tgnn-inference.onrender.com` or `http://localhost:8000`).

---

## 🌐 Deploying Frontend to Render (Static Site)

1. Create a **New Static Site** on Render.
2. Connect repository: `https://github.com/yakshitt/tgnn-inference`
3. Configure settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://tgnn-inference.onrender.com`

---

## 💻 Running the Backend Locally

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Sample Prediction Request (cURL)
```bash
curl -X POST "https://tgnn-inference.onrender.com/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "src_id": "1960-0040",
       "dst_id": "1961-0030",
       "relation": "CausalRelation"
     }'
```

**Expected Response**:
```json
{
  "probability": 0.5577905178070068,
  "verdict": true
}
```
