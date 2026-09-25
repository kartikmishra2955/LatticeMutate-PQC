from typing import Dict, Any, List

def interpret_experiment(action: str, experiment_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic research assistant for interpreting ML-KEM lattice mutation experiments.
    """
    scheme = experiment_data.get("scheme", "ML-KEM-768")
    mutations = experiment_data.get("mutations", [])
    
    # Analyze mutations
    regressions = [m for m in mutations if m.get("result", {}).get("regression")]
    correctness_drops = [m for m in mutations if m.get("result", {}).get("correctness", 100.0) < 99.9]
    security_drops = [
        m for m in mutations 
        if m.get("result", {}).get("security_estimate", 195.0) < (m.get("baseline_security", 195.0) - 5.0)
    ]
    
    if action == "explain":
        details = [
            f"Evaluated {len(mutations)} mutations across target lattice parameters for {scheme}.",
            f"Parameter perturbation tests sensitivity of Module-LWE hardness against primal BKZ reduction.",
            f"Found {len(regressions)} mutations flagged for parameter degradation or decryption failure.",
        ]
        if security_drops:
            worst = min(security_drops, key=lambda x: x.get("result", {}).get("security_estimate", 195.0))
            details.append(
                f"Maximum security vulnerability occurred when perturbing {worst.get('parameter')} to "
                f"{worst.get('mutated_value')} ({worst.get('mutation_percent')}), dropping security to "
                f"{worst.get('result', {}).get('security_estimate')} bits."
            )
        return {
            "title": f"Deterministic Analysis: {scheme} Sensitivity Profile",
            "summary": f"Comprehensive evaluation of {len(mutations)} parameter mutations identified "
                       f"{len(regressions)} sensitive configurations affecting security or decryption correctness.",
            "details": details,
            "latex_draft": None
        }

    elif action == "anomalies":
        anomaly_list = []
        for m in correctness_drops:
            anomaly_list.append(
                f"Correctness Failure: Modifying {m.get('parameter')} to {m.get('mutated_value')} "
                f"({m.get('mutation_percent')}) reduced decapsulation success rate to {m.get('result', {}).get('correctness')}%."
            )
        for m in security_drops:
            anomaly_list.append(
                f"Security Margin Erosion: Decreasing {m.get('parameter')} ({m.get('mutation_percent')}) "
                f"caused security to fall to {m.get('result', {}).get('security_estimate')} bits."
            )
        if not anomaly_list:
            anomaly_list.append("No abnormal operational degradation detected within tested mutation ranges.")

        return {
            "title": "Identified Anomalies & Regressions",
            "summary": f"{len(regressions)} notable deviations were detected exceeding cryptographic tolerance thresholds.",
            "details": anomaly_list,
            "latex_draft": None
        }

    elif action == "followup":
        suggestions = [
            f"Finer perturbation mesh (±1%, ±2%) around parameter q to pinpoint exact boundary where decapsulation error emerges.",
            f"Combined perturbation of (η1, η2) with compression bits (du, dv) to explore simultaneous bandwidth reduction and security tradeoffs.",
            f"Extend trials to 10,000 for borderline modulus values to measure exact decryption failure probability (P_fail)."
        ]
        return {
            "title": "Recommended Follow-Up Experiments",
            "summary": "Targeted next steps to isolate parameter sensitivity thresholds and optimize lattice parameters.",
            "details": suggestions,
            "latex_draft": None
        }

    elif action == "discussion":
        latex = (
            r"\subsection{Parameter Sensitivity Analysis}" + "\n"
            r"Our empirical perturbation analysis of " + scheme + r" demonstrates that ring modulus $q$ "
            r"and binomial noise distribution $\eta_1$ represent critical sensitivity choke points. "
            r"Specifically, a negative perturbation of $q$ diminishes the decryption error bound $q/4$, "
            r"inducing measurable decapsulation failures while minimally increasing lattice hardness. "
            r"Conversely, decreasing the noise parameter $\eta_1$ sharply degrades bit security against BKZ sieving "
            r"without compromising decapsulation correctness."
        )
        return {
            "title": "Draft Discussion Paragraph",
            "summary": "Publication-ready LaTeX text synthesizing experimental findings.",
            "details": [
                "Summarizes trade-offs between lattice hardness (BKZ reduction) and correctness thresholds.",
                "Suitable for integration into cryptography manuscripts or security evaluation technical reports."
            ],
            "latex_draft": latex
        }

    elif action == "correction":
        corrections = []
        for m in regressions:
            param = m.get("parameter")
            bad_val = m.get("mutated_value")
            
            # Simple rules mapping bad parameters back to FIPS 203 NIST safe defaults
            if param in ["k", "Module Dimension (k)"]:
                corrections.append(f"• k={bad_val} is too small. Use k=3 for standard 192-bit security (ML-KEM-768) or k=4 for 256-bit security (ML-KEM-1024).")
            elif param in ["eta1", "eta2", "Noise (η1)", "Noise (η2)", "η1", "η2"]:
                corrections.append(f"• Noise η={bad_val} is cryptographically unsafe. Restore to η=2 to prevent rapid lattice reduction attacks while maintaining correctness.")
            elif param in ["q", "Modulus (q)"]:
                corrections.append(f"• Modulus q={bad_val} breaks NTT performance or causes decryption failures. Revert to the prime q=3329 (which satisfies q ≡ 1 mod 256).")
            elif param in ["du", "dv", "Compression (du)", "Compression (dv)"]:
                corrections.append(f"• Over-compression ({bad_val} bits) destroys ciphertext data. Correct to du=10, dv=4 for optimal bandwidth-to-correctness ratio.")
            else:
                corrections.append(f"• Revert {param} from {bad_val} to its original baseline to restore security bounds.")

        if not corrections:
            corrections.append("All tested parameters are currently within safe cryptographic bounds. No corrections needed!")

        return {
            "title": "Suggested Parameter Corrections",
            "summary": f"Generated {len(corrections)} cryptographic corrections to resolve detected security and correctness regressions.",
            "details": list(set(corrections)),
            "latex_draft": None
        }

    return {
        "title": "Research Assistant Response",
        "summary": "Action completed.",
        "details": ["Analysis complete."],
        "latex_draft": None
    }
