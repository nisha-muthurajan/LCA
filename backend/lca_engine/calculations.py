def calculate_lca(data):
    """
    Basic LCA Engine. 
    In a real app, you would fetch specific emission factors based on material type.
    """
    # Standard Emission Factors (Placeholder values)
    # CO2 per unit
    EF_ENERGY = 0.85  # kg CO2 per kWh (Coal-heavy grid)
    EF_WATER = 0.3    # kg CO2 per Liter processed
    EF_MATERIAL = 1.5 # kg CO2 per Ton of generic material extraction

    energy = data.get('energy_consumption', 0)
    water = data.get('water_usage', 0)
    material = data.get('raw_material_qty', 0)

    # 1. Carbon Footprint Calculation
    carbon_score = (energy * EF_ENERGY) + (water * EF_WATER) + (material * EF_MATERIAL)

    # 2. Circularity Score (Simple heuristic for now)
    # Lower resource usage relative to output = better circularity
    efficiency_ratio = material / (energy + 1) # Avoid div by zero
    circularity_score = min(100, efficiency_ratio * 100)

    return {
        "carbon_footprint": round(carbon_score, 2),
        "circularity_score": round(circularity_score, 2),
        "recommendation": generate_recommendation(carbon_score)
    }

def generate_recommendation(carbon_score):
    if carbon_score > 1000:
        return "High Impact: Consider switching to renewable energy sources."
    return "Moderate Impact: Optimize water recycling to improve score."