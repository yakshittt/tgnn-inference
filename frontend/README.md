# TemporalGNN Disaster Cascade Prediction — React Frontend

A modern, responsive React + Vite web dashboard for interacting with the **Temporal Graph Neural Network (TemporalGNN)** disaster cascade inference service.

---

## 🌟 Features

- **Live Node & Relation Loading**: Automatically populates 1,970 historical disaster nodes (`GET /nodes`) and 11 cascade relation types (`GET /relations`) directly from the backend.
- **Searchable Combobox**: Fast, debounced filtering over 1,970 event IDs with keyboard navigation and clear buttons.
- **Visual Probability Gauge**: Circular progress gauge showing probability percentages and threshold indicators.
- **Verdict Highlighting**: Clear positive (`CASCADE PREDICTED - TRUE`) and negative (`NO CASCADE - FALSE`) state styling.
- **Quick Demo Presets**: Instant pre-loaded benchmark pairs for easy demonstration.
- **Link Flow Diagram**: Displays the directional cascade graph edge `[src_id] ──(relation: prob%)──▶ [dst_id]`.
- **API Status Indicator**: Real-time health badge pinging `/health`.

---

## 🛠️ Local Development

### Prerequisites
- Node.js `v18+` or `v20+` / `v24+`
- npm `v9+` or `v10+`

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_API_URL=https://tgnn-inference.onrender.com
```
*(For local testing with local FastAPI, set `VITE_API_URL=http://localhost:8000`)*

### 3. Start Vite Dev Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🚀 Render Static Site Deployment

To deploy this frontend separately on [Render](https://render.com) as a **Static Site**:

| Setting | Value |
|---|---|
| **Service Type** | **Static Site** |
| **Name** | `tgnn-disaster-cascade-ui` *(or your preferred name)* |
| **Repository** | `https://github.com/yakshitt/tgnn-inference` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Environment Variables on Render
Add this environment variable under the Render Static Site dashboard:
- **`VITE_API_URL`**: `https://tgnn-inference.onrender.com`
