import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Definisikan interface User berdasarkan skema Prisma kamu
export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    provider: 'LOCAL' | 'GOOGLE' | 'GITHUB'; // Sesuaikan dengan enum Provider kamu
    provider_id: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;

    // Actions
    login: (user: User, token?: string) => void;
    logout: () => void;
    updateProfile: (updatedFields: Partial<Pick<User, 'name' | 'avatar_url' | 'bio'>>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => set({ user, token }),


            login: (user, token) =>
                set({ user, token, isAuthenticated: true }),

            logout: () =>
                set({ user: null, token: null, isAuthenticated: false }),

            updateProfile: (updatedFields) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedFields } : null,
                })),
        }),
        {
            name: 'auth-storage', // Nama key di localStorage
            storage: createJSONStorage(() => localStorage), // Menyimpan state agar tidak hilang saat di-refresh
        }
    )
);