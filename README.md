# FoodBridge AI

FoodBridge AI is an intelligent platform designed for nutrition tracking, grocery management, and price intelligence.

This repository represents the **Phase 0 Foundation** of the project, establishing the base frontend shell, minimal FastAPI backend, Supabase configuration patterns, and communication pipeline.

---

## 1. Project Structure

```text
foodbridge/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py         # Application settings via pydantic-settings
│   │   ├── database.py       # Supabase client singleton initialization
│   │   └── main.py           # FastAPI application & /health endpoint
│   ├── .env.example          # Environment variables template for backend
│   ├── main.py               # Entrypoint script for running Uvicorn server
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── globals.css   # Global styles and Tailwind configuration
│   │       ├── layout.tsx    # Root layout
│   │       └── page.tsx      # Dashboard shell, navigation & health indicator
│   ├── .env.example          # Frontend environment variables template
│   ├── package.json          # Node.js dependencies and scripts
│   ├── tailwind.config.ts    # Tailwind CSS config
│   └── tsconfig.json         # TypeScript configuration
├── .gitignore                # Global git ignore rules
└── README.md                 # Project documentation & setup instructions
```

---

## 2. Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cd backend
cp .env.example .env
```
Default environment variables:
- `ENVIRONMENT`: `development`
- `FRONTEND_URL`: `http://localhost:3000`
- `SUPABASE_URL`: Your Supabase Project URL (optional for Phase 0 health checks)
- `SUPABASE_KEY`: Your Supabase Anon/Service Key (optional for Phase 0 health checks)

### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local` (optional, defaults to `http://localhost:8000`):
```bash
cd frontend
cp .env.example .env.local
```
- `NEXT_PUBLIC_API_URL`: `http://localhost:8000`

---

## 3. Installation & Run Instructions

### Prerequisites
- Python 3.10+ (tested with Python 3.13)
- Node.js 18+ (tested with Node.js 24)
- npm

### A. Run Backend (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI backend server:
   ```bash
   python main.py
   ```
   Or run using Uvicorn directly:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Check backend endpoints:
   - Health check: [http://localhost:8000/health](http://localhost:8000/health)
   - Interactive Swagger API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### B. Run Frontend (Next.js)

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   - [http://localhost:3000](http://localhost:3000)

The frontend landing shell displays navigation placeholders for:
- **Dashboard**
- **Nutrition**
- **Grocery Management**
- **Price Intelligence**
- **AI Assistant**

The sidebar includes an active **Backend Status** indicator which polls the `/health` endpoint and shows real-time connectivity status.

---

## 4. Phase 0 Verification

- **Backend Health Check**:
  ```bash
  curl http://localhost:8000/health
  # Response:
  # {"status":"healthy","service":"FoodBridge AI Backend","environment":"development","database":"not_configured"}
  ```
- **Frontend Build**:
  ```bash
  cd frontend
  npm run build
  ```
