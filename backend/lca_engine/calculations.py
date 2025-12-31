def calculate_lca(data):
    """
    Basic LCA Engine with Safety Checks.
    """
    # Standard Emission Factors (kg CO2e per unit)
    EF_ENERGY = 0.85  # kg CO2 per kWh
    EF_WATER = 0.3    # kg CO2 per Liter
    EF_MATERIAL = 1.5 # kg CO2 per Ton

    try:
        # --- THE FIX: Convert inputs to float (decimal numbers) ---
        energy = float(data.get('energy_consumption', 0))
        water = float(data.get('water_usage', 0))
        material = float(data.get('raw_material_qty', 0))
    except (ValueError, TypeError):
        # Fallback if bad data is sent
        energy = 0.0
        water = 0.0
        material = 0.0

    # 1. Carbon Footprint Calculation
    carbon_score = (energy * EF_ENERGY) + (water * EF_WATER) + (material * EF_MATERIAL)

    # 2. Circularity Score (Avoid division by zero)
    if (energy + material) > 0:
        efficiency_ratio = material / (energy + material + 1)
        circularity_score = min(100, efficiency_ratio * 100)
    else:
        circularity_score = 0

    return {
        "carbon_footprint": round(carbon_score, 2),
        "circularity_score": round(circularity_score, 2),
        "recommendation": generate_recommendation(carbon_score)
    }

def generate_recommendation(carbon_score):
    if carbon_score > 1000:
        return "High Impact: Consider switching to renewable energy sources."
    return "Moderate Impact: Optimize water recycling to improve score."