# House Price Predictor

## Current State
New project with empty backend and no frontend.

## Requested Changes (Diff)

### Add
- House price prediction form with inputs: location/ZIP, home size (sqft), bedrooms, bathrooms, property type, year built, lot size, amenities (pool, garage, fireplace, recently renovated)
- Price estimation algorithm in backend based on input parameters
- Results display: estimated price, confidence score, price range, price history trend
- Market insights section: market demand, nearby comps average, key statistics
- Key value drivers breakdown
- Comparable properties section (sample data)
- Neighborhood overview section

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: Motoko canister with predictPrice function that takes home parameters and returns estimated price, confidence, and market data
2. Frontend: Full landing page with navbar, hero section with two-column form+results card, insights strip, comparables, map placeholder, value drivers, footer
