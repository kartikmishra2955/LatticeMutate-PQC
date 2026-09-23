# ML-KEM baseline parameters as per NIST FIPS 203

PARAM_MAPPING = {
    "Module Dimension (k)": "k",
    "Dimension (n)": "n",
    "Modulus (q)": "q",
    "Compression (du)": "du",
    "Compression (dv)": "dv",
    "Noise (η1)": "eta1",
    "Noise (η2)": "eta2",
    "k": "k",
    "n": "n",
    "q": "q",
    "du": "du",
    "dv": "dv",
    "eta1": "eta1",
    "eta2": "eta2",
    "η1": "eta1",
    "η2": "eta2"
}

REVERSE_PARAM_MAPPING = {
    "k": "Module Dimension (k)",
    "n": "Dimension (n)",
    "q": "Modulus (q)",
    "du": "Compression (du)",
    "dv": "Compression (dv)",
    "eta1": "Noise (η1)",
    "eta2": "Noise (η2)"
}

BASELINES = {
    "512": {
        "scheme": "ML-KEM-512",
        "n": 256,
        "q": 3329,
        "k": 2,
        "du": 10,
        "dv": 4,
        "eta1": 3,
        "eta2": 2,
        "category": 1,
        "baseline_security": 140.0,
        "keygen_time_ms": 0.08,
        "encap_time_ms": 0.11,
        "decap_time_ms": 0.13
    },
    "768": {
        "scheme": "ML-KEM-768",
        "n": 256,
        "q": 3329,
        "k": 3,
        "du": 10,
        "dv": 4,
        "eta1": 2,
        "eta2": 2,
        "category": 3,
        "baseline_security": 195.0,
        "keygen_time_ms": 0.12,
        "encap_time_ms": 0.15,
        "decap_time_ms": 0.18
    },
    "1024": {
        "scheme": "ML-KEM-1024",
        "n": 256,
        "q": 3329,
        "k": 4,
        "du": 11,
        "dv": 5,
        "eta1": 2,
        "eta2": 2,
        "category": 5,
        "baseline_security": 260.0,
        "keygen_time_ms": 0.18,
        "encap_time_ms": 0.22,
        "decap_time_ms": 0.25
    },
}

def get_baseline_parameters(scheme: str):
    key = scheme.split("-")[-1] if "-" in scheme else scheme
    return BASELINES.get(key, BASELINES["768"])

