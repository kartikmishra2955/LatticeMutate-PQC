export const experimentStats = {
  totalExperiments: 124,
  mutationsTested: 8432,
  correctnessTests: 42160,
  securityEstimates: 8432,
  flaggedRegressions: 17,
}

export const baselineMLKEM = {
  scheme: "ML-KEM-768",
  k: 3,
  n: 256,
  q: 3329,
  du: 10,
  dv: 4,
  eta1: 2,
  eta2: 2,
  securityCategory: 3,
}

export const recentResults = [
  { id: "MUT-8472-1", parameter: "q", change: "-2%", securityEstimate: "192.4 bits", correctness: "100%", keyGen: "0.12ms", encapsulation: "0.15ms", decapsulation: "0.18ms", regression: false },
  { id: "MUT-8472-2", parameter: "q", change: "-5%", securityEstimate: "188.1 bits", correctness: "100%", keyGen: "0.11ms", encapsulation: "0.14ms", decapsulation: "0.17ms", regression: false },
  { id: "MUT-8472-3", parameter: "q", change: "-10%", securityEstimate: "172.5 bits", correctness: "94.2%", keyGen: "0.11ms", encapsulation: "0.14ms", decapsulation: "0.17ms", regression: true },
  { id: "MUT-8472-4", parameter: "η1", change: "+50%", securityEstimate: "201.2 bits", correctness: "100%", keyGen: "0.15ms", encapsulation: "0.19ms", decapsulation: "0.22ms", regression: false },
  { id: "MUT-8472-5", parameter: "η1", change: "-50%", securityEstimate: "154.8 bits", correctness: "98.1%", keyGen: "0.10ms", encapsulation: "0.12ms", decapsulation: "0.15ms", regression: true },
]

export const sensitivityData = [
  { perturbation: -10, security: 172.5, executionTime: 0.95, correctness: 94.2 },
  { perturbation: -5, security: 188.1, executionTime: 0.97, correctness: 100 },
  { perturbation: -2, security: 192.4, executionTime: 0.99, correctness: 100 },
  { perturbation: 0, security: 195.0, executionTime: 1.00, correctness: 100 },
  { perturbation: 2, security: 196.2, executionTime: 1.02, correctness: 100 },
  { perturbation: 5, security: 198.5, executionTime: 1.08, correctness: 100 },
  { perturbation: 10, security: 204.1, executionTime: 1.15, correctness: 100 },
]

export const mutationsList = [
  { id: "MUT-8472-1", baselineId: "EXP-8472", parameter: "q", original: 3329, mutated: 3262, mutationPercent: "-2%", status: "Valid", seed: "0x4f8a9" },
  { id: "MUT-8472-2", baselineId: "EXP-8472", parameter: "q", original: 3329, mutated: 3163, mutationPercent: "-5%", status: "Valid", seed: "0x4f8a9" },
  { id: "MUT-8472-3", baselineId: "EXP-8472", parameter: "q", original: 3329, mutated: 2996, mutationPercent: "-10%", status: "Warning", seed: "0x4f8a9" },
  { id: "MUT-8472-4", baselineId: "EXP-8472", parameter: "η1", original: 2, mutated: 3, mutationPercent: "+50%", status: "Valid", seed: "0x4f8a9" },
  { id: "MUT-8472-5", baselineId: "EXP-8472", parameter: "η1", original: 2, mutated: 1, mutationPercent: "-50%", status: "Warning", seed: "0x4f8a9" },
]
