#include <stdlib.h>
#include <stdint.h>

// A fast pseudo-random generator
static uint32_t state = 123456789;
static uint32_t xorshift32() {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return state;
}

// Simulates the computational complexity of ML-KEM matrix-vector multiplication
// and Number Theoretic Transform (NTT) operations over a ring.
void simulate_kyber_workload(int k, int n, int q, int eta, int trials) {
    // Allocate simple arrays to act as our lattice vectors
    int64_t *vec_in = (int64_t *)malloc(k * n * sizeof(int64_t));
    int64_t *vec_out = (int64_t *)malloc(k * n * sizeof(int64_t));
    int64_t *matrix_A = (int64_t *)malloc(k * k * n * sizeof(int64_t));

    // Initialize with dummy data based on parameters
    for (int i = 0; i < k * n; i++) {
        vec_in[i] = xorshift32() % q;
        vec_out[i] = 0;
    }
    for (int i = 0; i < k * k * n; i++) {
        matrix_A[i] = xorshift32() % q;
    }

    // Run the simulated workload `trials` times
    for (int t = 0; t < trials; t++) {
        // 1. Simulate sampling noise (eta)
        for (int i = 0; i < k * n; i++) {
            // Noise sampling complexity grows slightly with eta
            int64_t noise = 0;
            for (int e = 0; e < eta; e++) {
                noise += (xorshift32() & 1) - (xorshift32() & 1);
            }
            vec_in[i] = (vec_in[i] + noise) % q;
        }

        // 2. Simulate NTT matrix multiplication A * vec_in
        // This is O(k^2 * n) operations
        for (int row = 0; row < k; row++) {
            for (int col = 0; col < k; col++) {
                for (int i = 0; i < n; i++) {
                    int64_t a_val = matrix_A[(row * k + col) * n + i];
                    int64_t s_val = vec_in[col * n + i];
                    
                    // Multiply and reduce modulo q
                    vec_out[row * n + i] = (vec_out[row * n + i] + a_val * s_val) % q;
                }
            }
        }
    }

    free(vec_in);
    free(vec_out);
    free(matrix_A);
}
