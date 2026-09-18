def generate_mutations(base_value: float, ranges: list):
    """
    Generates deterministic mutations based on percentage ranges.
    E.g., ranges = ['±1%', '±2%', '±5%', '±10%']
    """
    mutations = []
    
    # Simple deterministic mapping for demonstration
    for r in ranges:
        if r == "±1%":
            mutations.extend([base_value * 1.01, base_value * 0.99])
        elif r == "±2%":
            mutations.extend([base_value * 1.02, base_value * 0.98])
        elif r == "±5%":
            mutations.extend([base_value * 1.05, base_value * 0.95])
        elif r == "±10%":
            mutations.extend([base_value * 1.10, base_value * 0.90])
            
    return [round(m, 2) for m in set(mutations)]
