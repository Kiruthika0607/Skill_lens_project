# AI & ML Methodology

## AI Architecture Philosophy
AI and ML components operate as **assistive intelligence layer** (NLP extraction, taxonomy alias matching, similarity scoring, trend forecasting, topological graph sorting) — while keeping all final recommendations **100% explainable and deterministic**.

## AI Pipelines

### 1. Hybrid Skill Extraction
- **Layer 1: Taxonomy Dictionary Exact Match**: Direct lookup against normalized alias database (Confidence: 1.0).
- **Layer 2: TF-IDF Cosine Similarity**: Scikit-Learn vectorizer comparing unstructured job description text against canonical skill taxonomy entities. Matches above threshold $0.35$ are extracted with similarity confidence weights.

### 2. Topological Graph Solver (NetworkX)
- Directed Graph $G = (V, E)$ where nodes $V$ are missing skills and edges $E$ represent `PREREQUISITE_FOR` relationships.
- Sorts stages using topological sort algorithm to guarantee prerequisite skills are learned before dependent skills.

### 3. Demand Forecasting Model
- Linear and polynomial trend fitting over historical demand snapshot time series.
- Output includes expected demand score and 95% confidence bounds ($\text{Lower}, \text{Upper}$).
