import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx

app = FastAPI(
    title="Industry Skill Intelligence AI Engine",
    description="NLP Skill Extraction, Taxonomy Similarity, Graph Topological Sorting & Trend Forecasting",
    version="1.0.0"
)

class SkillExtractRequest(BaseModel):
    text: str
    known_skills: Optional[List[str]] = []

class SkillExtractResponse(BaseModel):
    extracted_skills: List[Dict[str, float]]
    method: str

class ForecastRequest(BaseModel):
    historical_snapshots: List[Dict[str, float]]
    forecast_periods: int = 3

class GraphPathRequest(BaseModel):
    missing_skills: List[str]
    prerequisite_edges: List[Dict[str, str]]

@app.get("/")
def read_root():
    return {"status": "ACTIVE", "engine": "FastAPI AI/ML Intelligence Service", "version": "1.0.0"}

@app.post("/extract-skills", response_model=SkillExtractResponse)
def extract_skills(req: SkillExtractRequest):
    text_lower = req.text.lower()
    extracted = []
    
    if req.known_skills:
        # TF-IDF Cosine Similarity & Substring Matching
        vectorizer = TfidfVectorizer().fit([req.text] + req.known_skills)
        text_vec = vectorizer.transform([req.text])
        skill_vecs = vectorizer.transform(req.known_skills)
        sims = cosine_similarity(text_vec, skill_vecs)[0]
        
        for idx, skill in enumerate(req.known_skills):
            score = float(sims[idx])
            if skill.lower() in text_lower or score > 0.35:
                confidence = 0.95 if skill.lower() in text_lower else round(score, 2)
                extracted.append({"skill": skill, "confidence": confidence})
    
    return {
        "extracted_skills": sorted(extracted, key=lambda x: x["confidence"], reverse=True),
        "method": "Hybrid TF-IDF Cosine Similarity & Dictionary Extraction"
    }

@app.post("/forecast/skills")
def forecast_skill_demand(req: ForecastRequest):
    if not req.historical_snapshots:
        raise HTTPException(status_code=400, detail="Historical snapshots array required.")
    
    df = pd.DataFrame(req.historical_snapshots)
    if "demand_score" not in df.columns:
        raise HTTPException(status_code=400, detail="Snapshots must contain demand_score.")
    
    y = df["demand_score"].values
    x = np.arange(len(y))
    
    # Linear Trend Fit
    if len(y) > 1:
        poly = np.polyfit(x, y, 1)
        slope, intercept = poly[0], poly[1]
    else:
        slope, intercept = 0.5, y[0] if len(y) > 0 else 50.0
    
    future_x = np.arange(len(y), len(y) + req.forecast_periods)
    future_y = np.clip(slope * future_x + intercept, 0, 100)
    
    forecasts = []
    for i, score in enumerate(future_y):
        lower = float(np.clip(score - 5.0, 0, 100))
        upper = float(np.clip(score + 5.0, 0, 100))
        forecasts.append({
            "period": i + 1,
            "predicted_demand_score": float(round(score, 1)),
            "confidence_interval_lower": round(lower, 1),
            "confidence_interval_upper": round(upper, 1)
        })
        
    return {
        "trend_slope": float(round(slope, 3)),
        "trend_direction": "UPWARD" if slope > 0.5 else ("DOWNWARD" if slope < -0.5 else "STABLE"),
        "forecasts": forecasts
    }

@app.post("/graph/path")
def generate_graph_path(req: GraphPathRequest):
    G = nx.DiGraph()
    for skill in req.missing_skills:
        G.add_node(skill)
        
    for edge in req.prerequisite_edges:
        u = edge.get("prerequisite")
        v = edge.get("target")
        if u in req.missing_skills and v in req.missing_skills:
            G.add_edge(u, v)
            
    try:
        ordered_skills = list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        ordered_skills = req.missing_skills
        
    return {"ordered_skills": ordered_skills, "graph_nodes": len(G.nodes), "graph_edges": len(G.edges)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
