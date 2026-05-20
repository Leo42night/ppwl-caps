import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type User } from '../stores/AuthStore';
import { elysiaErr } from '@/lib/elysiaErr';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export const useEmailAuth = () => {
    const loginStore = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    // 1. FUNGSI DAFTAR (REGISTER) MANUAL
    const registerWithEmail = useCallback(async (name: string, username: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, {
                name,
                username,
                email,
                password,
            });

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                return true; // Mengembalikan true agar komponen tahu registrasi berhasil
            }
            return false;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Gagal mendaftarkan akun';
            setError(errMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. FUNGSI LOGIN MANUAL
    const loginWithEmail = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
                email,
                password,
            });

            if (response.data.success && response.data.user && response.data.token) {
                // Simpan user dan token ke Zustand store (mengaktifkan session)
                loginStore(response.data.user, response.data.token);

                // Arahkan user ke halaman utama setelah sukses login
                navigate('/', { replace: true });
                return true;
            }
            return false;
        } catch (err: any) {
            elysiaErr(err);
            const errMsg = err.response?.data?.message || 'Email atau password salah';
            setError(errMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [loginStore, navigate]);

    return {
        isLoading,
        error,
        successMessage,
        registerWithEmail,
        loginWithEmail,
    };
};