import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { elysiaErr } from '@/lib/elysiaErr';
import { BACKEND_URL } from '@/constants';
import { defAvatar } from '@/lib/utils';
import type { User } from '@/types';

interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export const useEmailAuth = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorData, setErrorData] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    // 1. FUNGSI DAFTAR (REGISTER) MANUAL
    const registerWithEmail = useCallback(async (name: string, username: string, email: string, password: string) => {
        setIsLoading(true);
        setErrorData(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post<AuthResponse>(`${BACKEND_URL}/auth/register`, {
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
            elysiaErr(err);
            const errData = err.response?.data;
            console.log("errData", errData);
            setErrorData(errData);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. FUNGSI LOGIN MANUAL
    const loginWithEmail = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setErrorData(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post<AuthResponse>(`${BACKEND_URL}/auth/login`, {
                email,
                password,
            });

            if (response.data.success && response.data.user && response.data.token) {
                // Simpan user dan token ke Zustand store (mengaktifkan session)
                response.data.user.avatar_url = defAvatar(response.data.user.name);
                setAuth(response.data.user, response.data.token);

                // Arahkan user ke halaman utama setelah sukses login
                navigate('/', { replace: true });
                return true;
            }
            return false;
        } catch (err: any) {
            elysiaErr(err);
            const errData = err.response?.data || { message: "email or password wrong" };
            setErrorData(errData);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setAuth, navigate]);

    return {
        isLoading,
        errorData,
        successMessage,
        registerWithEmail,
        loginWithEmail,
    };
};