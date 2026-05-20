import axios from "axios";

// Pakai ketika catch error dari elysia backend
export function elysiaErr(err: any) {
    // 1. Cek jika error berasal dari Axios (Response dari Backend)
    if (axios.isAxiosError(err)) {
        console.error("Login Error (Backend):", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data, // Ini biasanya berisi detail error dari backend
            message: err.message
        });

        // Opsional: Tampilkan pesan spesifik ke user via Toast
        const errorDetail = err.response?.data?.message || "Terjadi kesalahan pada server.";
        console.error(`Gagal Login: ${errorDetail}`);
    }
    // 2. Cek jika error terjadi saat setup request (Network error)
    else if (err.request) {
        console.error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
        console.error("Login Error (Network):", err.request);
    }
    // 3. Error lainnya (Code error/Syntax)
    else {
        console.error(`Error: ${err.message}`);
    }
}