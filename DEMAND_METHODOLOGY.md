# Demand Score Methodology & Formulas

## Overview
Industry skill demand is calculated deterministically through a transparent, weighted formula across the ingested job corpus:

$$\text{DemandScore} = 0.40 \cdot \text{JobFreqScore} + 0.30 \cdot \text{GrowthRateScore} + 0.15 \cdot \text{IndustrySpreadScore} + 0.15 \cdot \text{GeoSpreadScore}$$

## Variable Definitions

### 1. Job Frequency Score ($0.40$)
$$\text{JobFreqScore} = \min\left(100, \left(\frac{\text{Skill Job Count}}{\text{Total Ingested Jobs}}\right) \times 400\right)$$
- Measures absolute market presence across job listings.

### 2. Growth Rate Score ($0.30$)
$$\text{GrowthRate} = \frac{\text{Current Period Jobs} - \text{Prior Period Jobs}}{\text{Prior Period Jobs}} \times 100$$
$$\text{GrowthRateScore} = \min\left(100, \max\left(0, 50 + (\text{GrowthRate} \times 2)\right)\right)$$
- Measures skill momentum across snapshot periods.

### 3. Industry Spread Score ($0.15$)
$$\text{IndustrySpreadScore} = \min(100, \text{Distinct Industry Sector Count} \times 20)$$
- Measures cross-industry domain versatility.

### 4. Geo Spread Score ($0.15$)
$$\text{GeoSpreadScore} = \min(100, \text{Distinct Location Count} \times 15)$$
- Measures geographic mobility and remote demand.
