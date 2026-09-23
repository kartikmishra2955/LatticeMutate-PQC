import math

def estimate_security(
    parameter: str,
    mutated_value: float,
    baseline_value: float,
    baseline_security: float = 195.0
) -> float:
    """
    Simulates the Lattice Estimator output (e.g., Martin Albrecht's lattice-estimator).
    Models post-quantum bit security against primal/dual BKZ sieving attacks.
    """
    if baseline_value <= 0 or mutated_value <= 0:
        return 0.0

    ratio = mutated_value / baseline_value

    # Module dimension k: Security scales almost linearly with total lattice dimension (k * n)
    if parameter in ["k", "Module Dimension (k)"]:
        # e.g., k=3 is ~195 bits (65 bits per dimension); k=2 is ~140; k=4 is ~260
        diff = mutated_value - baseline_value
        estimated = baseline_security + (diff * 60.0)

    # Ring degree n: Lattice dimension scales with n
    elif parameter in ["n", "Dimension (n)"]:
        diff_ratio = (mutated_value - baseline_value) / baseline_value
        estimated = baseline_security * (1.0 + diff_ratio * 0.85)

    # Noise parameter eta1 / eta2: Variance is eta/2. Smaller noise makes LWE much easier.
    elif parameter in ["eta1", "eta2", "Noise (η1)", "Noise (η2)", "η1", "η2"]:
        # If noise decreases, security drops steeply; if noise increases, security increases moderately
        if ratio < 1.0:
            # Steep drop (e.g. eta 2 -> 1 drops ~40 bits)
            estimated = baseline_security * (ratio ** 0.65)
        else:
            estimated = baseline_security * (ratio ** 0.25)

    # Modulus q: In LWE, increasing q with fixed noise variance makes the lattice denser and EASIER to reduce.
    # Decreasing q makes the lattice harder (security rises slightly), but increases decryption failure.
    elif parameter in ["q", "Modulus (q)"]:
        # Inverse logarithmic relationship with q
        # A 10% decrease in q increases security slightly (~2-3 bits) or maintains it
        # However, non-standard q breaks NTT structure
        estimated = baseline_security * ((1.0 / ratio) ** 0.3)

    # Compression bits du / dv
    elif parameter in ["du", "dv", "Compression (du)", "Compression (dv)"]:
        # Minor impact on security, mostly affects error probability
        diff = mutated_value - baseline_value
        estimated = baseline_security + (diff * 1.5)

    else:
        estimated = baseline_security * (ratio ** 0.5)

    return max(10.0, round(estimated, 1))

