---
title: TemporalGNN Disaster Cascade Prediction
emoji: 🌪️
colorFrom: red
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# TemporalGNN Disaster Cascade Prediction API

An inference-only microservice for predicting disaster cascade links between historical disaster events using a trained **Temporal Graph Neural Network (`TemporalGNN`)**.

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

## 💻 Local Testing & Usage

### 1. Run with Uvicorn

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Or using `uv`:
```powershell
uv run --with fastapi --with uvicorn --with torch uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

### 2. Sample Requests

#### Health Check
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get
```
```bash
curl -X GET "http://127.0.0.1:8000/health"
```

#### Predict Link (PowerShell)
```powershell
$body = @{
    src_id = "1960-0040"
    dst_id = "1961-0030"
    relation = "CausalRelation"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### Predict Link (cURL)
```bash
curl -X POST "http://127.0.0.1:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "src_id": "1960-0040",
       "dst_id": "1961-0030",
       "relation": "CausalRelation"
     }'
```

#### Expected Response
```json
{
  "probability": 0.5577905178070068,
  "verdict": true
}
```

---

### 3. Docker Deployment

```bash
docker build -t tgnn-inference .
docker run -p 7860:7860 tgnn-inference
```
