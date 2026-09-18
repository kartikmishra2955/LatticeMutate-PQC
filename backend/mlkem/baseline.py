# ML-KEM baseline parameters as per FIPS 203
def get_baseline_parameters(scheme: str):
    baselines = {
        "512": {"n": 256, "q": 3329, "k": 2, "du": 10, "dv": 4, "eta1": 3, "eta2": 2, "category": 1},
        "768": {"n": 256, "q": 3329, "k": 3, "du": 10, "dv": 4, "eta1": 2, "eta2": 2, "category": 3},
        "1024": {"n": 256, "q": 3329, "k": 4, "du": 11, "dv": 5, "eta1": 2, "eta2": 2, "category": 5},
    }
    
    # Extract the number from ML-KEM-768 for example
    key = scheme.split("-")[-1] if "-" in scheme else scheme
    return baselines.get(key, baselines["768"])
