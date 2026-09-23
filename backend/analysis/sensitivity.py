from typing import List, Dict, Any

def calculate_sensitivity_score(delta_metric: float, metric: float, delta_param: float, param: float) -> float:
    """
    Calculates normalized sensitivity elasticity:
    S_p = (ΔM / M) / (Δp / p)
    """
    if metric == 0 or param == 0 or delta_param == 0:
        return 0.0
        
    term1 = delta_metric / metric
    term2 = delta_param / param
    
    if term2 == 0:
        return 0.0
        
    return round(term1 / term2, 4)

def aggregate_sensitivity_for_experiment(mutations_with_results: List[Dict[str, Any]], baseline: Dict[str, Any]) -> Dict[str, Any]:
    """
    Aggregates sensitivity scores by parameter and metric across all evaluated mutations.
    """
    scores_by_param: Dict[str, Dict[str, List[float]]] = {}
    
    for item in mutations_with_results:
        param = item.get("parameter", "q")
        orig = item.get("original_value", 1.0)
        mutated = item.get("mutated_value", orig)
        delta_param = mutated - orig
        
        res = item.get("result", {})
        if not res:
            continue
            
        base_sec = baseline.get("baseline_security", 195.0)
        curr_sec = res.get("security_estimate", base_sec)
        delta_sec = curr_sec - base_sec
        s_sec = calculate_sensitivity_score(delta_sec, base_sec, delta_param, orig)
        
        base_time = baseline.get("encap_time_ms", 0.15)
        curr_time = res.get("encap_time", base_time)
        delta_time = curr_time - base_time
        s_time = calculate_sensitivity_score(delta_time, base_time, delta_param, orig)
        
        # Error rate sensitivity
        corr = res.get("correctness", 100.0)
        err_rate = max(0.0, 100.0 - corr)
        s_err = round(abs(err_rate / (abs(delta_param / orig) * 100.0)), 2) if delta_param != 0 else 0.0

        if param not in scores_by_param:
            scores_by_param[param] = {"security": [], "runtime": [], "error": []}
            
        scores_by_param[param]["security"].append(abs(s_sec))
        scores_by_param[param]["runtime"].append(abs(s_time))
        scores_by_param[param]["error"].append(abs(s_err))

    # Compute averages
    summary: Dict[str, Dict[str, float]] = {}
    for p, metrics in scores_by_param.items():
        summary[p] = {
            "security_sensitivity": round(sum(metrics["security"]) / max(1, len(metrics["security"])), 2),
            "runtime_sensitivity": round(sum(metrics["runtime"]) / max(1, len(metrics["runtime"])), 2),
            "error_sensitivity": round(sum(metrics["error"]) / max(1, len(metrics["error"])), 2),
        }
        
    return summary

