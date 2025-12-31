def calculate_circularity(material_qty, waste_qty, recycled_input_qty):
    """
    Calculates a Circularity Score (0-100).
    Formula: (Recycled Input + (Material - Waste)) / Total Material Flow
    """
    if material_qty <= 0:
        return 0
    
    # Simple logic: Higher recycled input & lower waste = higher score
    circular_flow = recycled_input_qty + (material_qty - waste_qty)
    total_flow = material_qty + recycled_input_qty
    
    score = (circular_flow / total_flow) * 100
    
    # Cap score at 100
    return min(100, max(0, round(score, 2)))