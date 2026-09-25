import random
import time
import os
import ctypes
from typing import Dict, Any, Tuple

# Try to load the C simulation library
kyber_sim = None
try:
    # Build path to the compiled library
    lib_path = os.path.join(os.path.dirname(__file__), "c_src", "libkyber_sim.dylib")
    kyber_sim = ctypes.CDLL(lib_path)
    kyber_sim.simulate_kyber_workload.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int]
except Exception as e:
    print(f"Failed to load C benchmark library: {e}")

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

    # If the C library is loaded, use it for real CPU timing
    if kyber_sim is not None:
        # Determine actual parameters for this mutation
        c_k = int(baseline_params.get("k", 3))
        c_n = int(baseline_params.get("n", 256))
        c_q = int(baseline_params.get("q", 3329))
        c_eta = int(baseline_params.get("eta1", 2))
        
        if parameter in ["k", "Module Dimension (k)"]:
            c_k = max(1, int(mutated_value))
        elif parameter in ["n", "Dimension (n)"]:
            c_n = max(128, int(mutated_value))
        elif parameter in ["q", "Modulus (q)"]:
            c_q = max(2, int(mutated_value))
        elif parameter in ["eta1", "Noise (η1)", "η1"]:
            c_eta = max(1, int(mutated_value))

        # Run 5000 iterations in C to get a measurable CPU time profile
        inner_trials = 5000
        
        t0 = time.perf_counter()
        kyber_sim.simulate_kyber_workload(c_k, c_n, c_q, c_eta, inner_trials)
        t1 = time.perf_counter()
        
        # Calculate raw milliseconds per trial
        raw_ms = ((t1 - t0) * 1000.0) / inner_trials
        
        # Apply calibration factor because our C simulation is simpler than full Kyber (which includes SHA3 hashing, etc.)
        calibration = 25.0
        calibrated_ms = raw_ms * calibration
        
        # Derive proportional times
        keygen_time = round(calibrated_ms * 0.8 + jitter, 3)
        encap_time = round(calibrated_ms * 1.0 + jitter, 3)
        decap_time = round(calibrated_ms * 1.2 + jitter, 3)
        
    else:
        # Fallback to pure math simulation
        if parameter in ["k", "Module Dimension (k)"]:
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
