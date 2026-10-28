# Installation & Setup Guide

## Prerequisites
- **Node.js**: v18+ or v25 (npm 10+)
- **Python**: 3.11+ (Optional, for Python FastAPI service)

## Step-by-Step Installation

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Seed Database
From project root directory:
```bash
npx -y tsx scripts/seed.ts
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev --prefix server

# Terminal 2: Frontend Client (Port 5173)
npm run dev --prefix client
```

### 5. Open Application
Navigate to `http://localhost:5173` in your browser.
