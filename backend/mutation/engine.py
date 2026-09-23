import re
from typing import List, Dict, Any, Tuple

def parse_range_percentage(range_str: str) -> List[float]:
    """
    Parses strings like '±5%', '+5%', '-10%', '±2%', '5' into signed float fractions.
    E.g. '±5%' -> [-0.05, 0.05]
    """
    clean = range_str.strip().replace("%", "")
    match = re.search(r"([+-]?\d+(?:\.\d+)?)", clean)
    if not match:
        return [-0.05, 0.05]
    
    val = float(match.group(1)) / 100.0
    if "±" in range_str or "+-" in range_str:
        return [-abs(val), abs(val)]
    elif range_str.startswith("-"):
        return [-abs(val)]
    elif range_str.startswith("+"):
        return [abs(val)]
    else:
        # Default to symmetric if no sign specified
        return [-abs(val), abs(val)]

def mutate_parameter(
    param: str,
    base_value: float,
    fraction: float
) -> Tuple[float, str, str]:
    """
    Mutates a single parameter according to lattice cryptographic rules.
    Returns (mutated_value, percentage_label, status)
    """
    pct_label = f"{'+' if fraction > 0 else ''}{int(round(fraction * 100))}%"
    
    # Discrete small integers (k, eta1, eta2, du, dv)
    if param in ["k", "Module Dimension (k)"]:
        step = int(round(fraction * 10))
        if step == 0:
            step = 1 if fraction > 0 else -1
        mutated = max(1, int(round(base_value + step)))
        status = "Valid" if mutated in [2, 3, 4] else ("Warning" if mutated >= 1 else "Invalid")
        return float(mutated), pct_label, status

    if param in ["eta1", "eta2", "Noise (η1)", "Noise (η2)", "η1", "η2"]:
        step = int(round(fraction * 4))
        if step == 0:
            step = 1 if fraction > 0 else -1
        mutated = max(1, int(round(base_value + step)))
        status = "Valid" if mutated in [2, 3] else ("Warning" if mutated == 1 else "Invalid")
        return float(mutated), pct_label, status

    if param in ["du", "dv", "Compression (du)", "Compression (dv)"]:
        step = int(round(fraction * 5))
        if step == 0:
            step = 1 if fraction > 0 else -1
        mutated = max(1, int(round(base_value + step)))
        status = "Valid" if (mutated >= 3 and mutated <= 12) else "Warning"
        return float(mutated), pct_label, status

    if param in ["n", "Dimension (n)"]:
        # Ring degree
        mutated = int(round(base_value * (1.0 + fraction)))
        status = "Valid" if mutated in [128, 256, 512] else "Warning"
        return float(mutated), pct_label, status

    if param in ["q", "Modulus (q)"]:
        # Modulus mutation
        mutated = int(round(base_value * (1.0 + fraction)))
        # NTT requires q = 1 mod 2n (i.e. q = 1 mod 512 for n=256)
        if mutated % 2 == 0:
            mutated += 1
        is_ntt = (mutated % 512 == 1)
        status = "Valid" if (abs(fraction) <= 0.05 and is_ntt) else "Warning"
        if mutated <= 256:
            status = "Invalid"
        return float(mutated), pct_label, status

    # Generic fallback
    mutated = round(base_value * (1.0 + fraction), 2)
    status = "Valid" if mutated > 0 else "Invalid"
    return mutated, pct_label, status

def generate_mutations_for_experiment(
    baseline_params: Dict[str, Any],
    parameters_to_mutate: List[str],
    mutation_ranges: List[str],
    seed: str
) -> List[Dict[str, Any]]:
    """
    Generates deterministic mutation configurations for an experiment.
    """
    from mlkem.baseline import PARAM_MAPPING

    fractions: List[float] = []
    for r in mutation_ranges:
        for f in parse_range_percentage(r):
            if f not in fractions:
                fractions.append(f)
    
    if not fractions:
        fractions = [-0.05, 0.05]
    
    fractions.sort()

    mutations = []
    mut_idx = 1
    
    for display_param in parameters_to_mutate:
        canonical_key = PARAM_MAPPING.get(display_param, display_param.lower())
        base_val = baseline_params.get(canonical_key)
        if base_val is None:
            # Try finding without description
            for k in baseline_params:
                if k in canonical_key or canonical_key in k:
                    base_val = baseline_params[k]
                    break
        if base_val is None:
            continue

        for frac in fractions:
            mut_val, pct_str, status = mutate_parameter(canonical_key, float(base_val), frac)
            mutations.append({
                "index": mut_idx,
                "parameter": canonical_key,
                "display_parameter": display_param,
                "original_value": float(base_val),
                "mutated_value": float(mut_val),
                "mutation_percent": pct_str,
                "fraction": frac,
                "status": status,
                "seed": seed
            })
            mut_idx += 1

    return mutations

def generate_mutations(base_value: float, ranges: list):
    """
    Legacy wrapper for backward compatibility.
    """
    fractions = []
    for r in ranges:
        fractions.extend(parse_range_percentage(r))
    return sorted(list(set([round(base_value * (1.0 + f), 2) for f in fractions])))

