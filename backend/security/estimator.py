def estimate_security(parameter: str, mutated_value: float, baseline_value: float, baseline_security: float = 195.0):
    """
    Simulates the Lattice Estimator output.
    In a real implementation, this would call the sage scripts from https://github.com/malb/lattice-estimator
    """
    # Simple deterministic simulation: security drops if parameter decreases
    change_ratio = mutated_value / baseline_value
    
    # Very rudimentary simulation for structural demonstration
    new_security = baseline_security * (change_ratio ** 0.5) 
    
    return round(new_security, 1)
