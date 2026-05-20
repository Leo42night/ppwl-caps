import { useState, useCallback } from 'react';
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";
import axios from 'axios';
import { useAuthStore } from '../stores/AuthStore';
import { BACKEND_URL } from '@/contants';
import { elysiaErr } from '@/lib/elysiaErr';
import { useNavigate } from 'react-router-dom';

export const useGoogleAuth = () => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated, setAuth, logout: clearStore } = useAuthStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error] = useState<string | null>(null);

    const handleGoogleSuccess = async (tokenResponse: TokenResponse) => {
        try {
            navigate('/');
            setIsLoading(true); // 🚀 Mulai loading sebelum request api berjalan

            // 1. Pakai access token, di backend ambil data google user
            const backendRes = await axios.post(`${BACKEND_URL}/auth/google`, {
                access_token: tokenResponse.access_token
            });
            // console.log("Response dari backend:", backendRes.data); // Debug: lihat response dari backend

            const jwtToken = backendRes.data.token;
            const created = backendRes.data.created;

            // 5. Simpan ke Zustand Store (otomatis masuk localStorage jika pakai persist)
            setAuth(backendRes.data.user, jwtToken);
            alert(`Anda berhasil login. ${created ? ' [Akun Dibuat]' : ''}`);

            console.log("Login berhasil!");
        } catch (err: any) {
            elysiaErr(err);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => console.log("Login Failed"),
    });

    // 3. Fungsi Logout
    const logout = useCallback(() => {
        clearStore();
        // Jika perlu, bersihkan sisa token/state lainnya dan arahkan ke halaman login
        window.location.href = '/auth';
    }, [clearStore]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        loginWithGoogle,
        logout,
    };
};