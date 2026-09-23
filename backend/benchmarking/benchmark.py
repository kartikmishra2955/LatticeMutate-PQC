import random
from typing import Dict, Any, Tuple

def evaluate_mutation_benchmark(
    parameter: str,
    mutated_value: float,
    original_value: float,
    baseline_params: Dict[str, Any],
    trials: int = 100,
    seed: str = "0x4f8a9b21"
) -> Tuple[float, float, float, float, bool]:
    """
    Evaluates keygen, encap, decap times and correctness for a mutated parameter.
    Returns (keygen_time, encap_time, decap_time, correctness, regression)
    """
    base_keygen = baseline_params.get("keygen_time_ms", 0.12)
    base_encap = baseline_params.get("encap_time_ms", 0.15)
    base_decap = baseline_params.get("decap_time_ms", 0.18)

    # Deterministic RNG derived from seed + param + mutated_value
    seed_int = int(str(seed).replace("0x", "")[:8], 16) if str(seed).startswith("0x") else abs(hash(str(seed)))
    param_int = abs(hash(f"{parameter}_{mutated_value}")) % 10000
    rng = random.Random(seed_int + param_int)

    jitter = (rng.random() - 0.5) * 0.005 # ±0.0025ms jitter

    # Time scaling by parameter
    if parameter in ["k", "Module Dimension (k)"]:
        # Matrix dimension scales as (k_new / k_orig)^2
        k_orig = baseline_params.get("k", 3)
        time_ratio = (mutated_value / k_orig) ** 1.8
        keygen_time = round(base_keygen * time_ratio + jitter, 3)
        encap_time = round(base_encap * time_ratio + jitter, 3)
        decap_time = round(base_decap * time_ratio + jitter, 3)
    elif parameter in ["n", "Dimension (n)"]:
        n_orig = baseline_params.get("n", 256)
        time_ratio = (mutated_value / n_orig) * 1.1
        keygen_time = round(base_keygen * time_ratio + jitter, 3)
        encap_time = round(base_encap * time_ratio + jitter, 3)
        decap_time = round(base_decap * time_ratio + jitter, 3)
    elif parameter in ["eta1", "Noise (η1)", "η1"]:
        # Noise sampling time is a fraction of total time
        eta_orig = baseline_params.get("eta1", 2)
        ratio = mutated_value / eta_orig
        keygen_time = round(base_keygen * (1.0 + (ratio - 1.0) * 0.08) + jitter, 3)
        encap_time = round(base_encap * (1.0 + (ratio - 1.0) * 0.08) + jitter, 3)
        decap_time = round(base_decap + jitter, 3)
    else:
        keygen_time = round(base_keygen + jitter, 3)
        encap_time = round(base_encap + jitter, 3)
        decap_time = round(base_decap + jitter, 3)

    keygen_time = max(0.01, keygen_time)
    encap_time = max(0.01, encap_time)
    decap_time = max(0.01, decap_time)

    # Correctness evaluation
    # Decryption fails if noise exceeds q/4
    correctness = 100.0
    regression = False

    if parameter in ["q", "Modulus (q)"]:
        q_orig = baseline_params.get("q", 3329)
        diff_pct = (mutated_value - q_orig) / q_orig
        if diff_pct < -0.05:
            # Significant modulus shrinkage shrinks q/4 threshold -> decrypt errors
            drop = min(35.0, abs(diff_pct) * 60.0 + rng.uniform(-0.5, 0.5))
            correctness = round(100.0 - drop, 1)
            regression = True
        elif diff_pct < -0.01:
            correctness = 100.0

    elif parameter in ["du", "dv", "Compression (du)", "Compression (dv)"]:
        base_bits = baseline_params.get(parameter, 10 if "du" in parameter else 4)
        if mutated_value < base_bits:
            # Under-compression causes loss of bits
            loss = (base_bits - mutated_value) * 4.5
            correctness = round(max(70.0, 100.0 - loss), 1)
            regression = True

    elif parameter in ["eta1", "Noise (η1)", "η1"]:
        if mutated_value < baseline_params.get("eta1", 2):
            # Noise too small: correctness is actually high, but security dropped severely!
            correctness = 100.0
            regression = True # Security regression
        elif mutated_value > 3:
            # Too much noise: small failure rate
            correctness = round(100.0 - (mutated_value - 3) * 1.8, 1)
            if correctness < 99.0:
                regression = True

    elif parameter in ["k", "Module Dimension (k)"]:
        if mutated_value < baseline_params.get("k", 3):
            # Dropping k from 3 to 2 causes major security regression
            regression = True

    return keygen_time, encap_time, decap_time, correctness, regression
