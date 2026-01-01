# Standard Emission Factors (kg CO2e per unit)
# In a real app, this would be a database table or API call.

EMISSION_FACTORS = {
    "energy": {
        "grid_mix": 0.85,  # kg CO2 per kWh (Coal heavy)
        "solar": 0.05,
        "wind": 0.02,
        "diesel": 2.68     # kg CO2 per Liter
    },
    "water": {
        "supply": 0.3,     # kg CO2 per Liter treated/pumped
        "treatment": 0.5
    },
    "materials": {
        "iron": 1.8,       # kg CO2 per kg
        "aluminum": 12.0,
        "copper": 3.5,
        "lithium": 15.0    # Mining intensive
    }
}

def get_factor(category, key):
    return EMISSION_FACTORS.get(category, {}).get(key, 0)