# Architecture & System Design Document

## System Overview

```
                               ┌────────────────────────────────────────────────────────┐
                               │   React + TypeScript + Vite + Tailwind Client Application│
                               │   (Recharts, Lucide, React Router, TanStack Query)     │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ REST API / HTTP-only Cookies
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │       Node.js + Express + TypeScript API Server        │
                               │   - Auth Middleware & RBAC                             │
                               │   - Skill Taxonomy Engine & Alias Normalizer           │
                               │   - Deterministic Career Matcher                       │
                               │   - Dependency Graph Path Solver                       │
                               │   - What-If Skill Simulator                            │
                               └──────────────┬───────────────────────────┬─────────────┘
                                              │                           │
                                              ▼                           ▼
                               ┌───────────────────────────┐ ┌───────────────────────────┐
                               │ Python 3.11 FastAPI       │ │ WASM / SQLite Relational  │
                               │ Intelligence Service      │ │ Database (25 Tables, FKs, │
                               │ - TF-IDF NLP Similarity   │ │ Indexes, Constraints)     │
                               │ - NetworkX Graph Paths    │ └───────────────────────────┘
                               │ - Demand Trend Forecast   │
                               └───────────────────────────┘
```

## Modular Layer Breakdown
1. **Frontend**: Institutional analytics aesthetic (Navy/Slate/Green Growth/Amber Warning/Red Gap/Indigo AI). Responsive 12-col desktop grid.
2. **Backend**: Express REST server with RBAC middleware (`student`, `admin`, `industry`).
3. **Intelligence Engine**: Python FastAPI microservice utilizing scikit-learn for TF-IDF NLP phrase matching, NetworkX for graph sorting, and linear/exponential regression for demand trend forecasting.
4. **Data Persistence**: 25 relational tables supporting standard SQL joins, foreign key cascades, and indexing.
