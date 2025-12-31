def get_ai_recommendations(carbon_footprint, energy_usage, industry_type):
    recommendations = []

    # 1. Energy Analysis
    if energy_usage > 5000:
        recommendations.append("High Energy Alert: Switch 30% of grid power to on-site solar to reduce Scope 2 emissions.")
    
    # 2. Industry Specifics
    if industry_type == "Mining":
        recommendations.append("Transport Optimization: Implement conveyor belts instead of diesel trucks for ore movement.")
    elif industry_type == "Metallurgy":
        recommendations.append("Heat Recovery: Install waste heat recovery systems in the smelting furnace.")

    # 3. General Sustainability
    if carbon_footprint > 10000:
        recommendations.append("Critical: Purchase Carbon Credits to offset immediate impact while upgrading tech.")

    return recommendations