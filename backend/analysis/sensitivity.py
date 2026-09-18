def calculate_sensitivity_score(delta_metric: float, metric: float, delta_param: float, param: float):
    """
    Calculates S_p = (ΔM / M) / (Δp / p)
    """
    if metric == 0 or param == 0 or delta_param == 0:
        return 0.0
        
    term1 = delta_metric / metric
    term2 = delta_param / param
    
    if term2 == 0:
        return 0.0
        
    return round(term1 / term2, 4)
