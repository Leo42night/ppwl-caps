import { BACKEND_URL } from '@/constants';
import { elysiaErr } from '@/lib/elysiaErr';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotifStore } from '@/stores/useNotifStore';
import type { ApiResponse, Notification } from '@/types';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

export const useNotif = () => {
    const user = useAuthStore((s) => s.user);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Ambil state dan action dari Zustand Store
    const setUnreadCount = useNotifStore((state) => state.setUnreadCount);

    // Menggunakan useCallback agar fungsi ini stabil dan bisa dipanggil manual (misal: fitur pull-to-refresh)
    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            // Menggunakan axios.get dengan generic type untuk struktur response
            const response = await axios.get<ApiResponse<Notification[]>>(
                `${BACKEND_URL}/data/user/${user?.id}/notif`
            );

            // Axios otomatis mem-parsing JSON dan menyimpannya di properti .data
            const result = response.data;

            // Jika berhasil (status 2xx), langsung set state
            setNotifications(result.data ?? []);

        } catch (err: any) {
            elysiaErr(err); // debug

            // Cek apakah error datang dari respon server (AxiosError)
            if (axios.isAxiosError(err) && err.response) {
                // Mengambil pesan error dari backend Elysia kamu jika ada
                const serverMessage = err.response.data?.message;
                setError(serverMessage || 'Gagal mengambil data notifikasi');
            } else {
                // Terjadi kesalahan jaringan (server mati/RTO) atau error kode lainnya
                setError(err.message || 'Terjadi kesalahan jaringan');
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Fungsi khusus mengambil jumlah notifikasi yang belum dibaca (Sederhana & Ringan)
    const fetchUnreadCount = useCallback(async () => {
        if (!user?.id) return;

        try {
            const resNotifUnreadCount = await axios.get<ApiResponse<number[]>>(
                `${BACKEND_URL}/data/user/${user?.id}/notif-unread-count`
            );
            console.log("resNotifUnreadCount.data", resNotifUnreadCount.data)
            // Set data ke Zustand Store, global state
            setUnreadCount(resNotifUnreadCount.data.count || 0);
        } catch (err) {
            elysiaErr(err); // debug

            // Cek apakah error datang dari respon server (AxiosError)
            if (axios.isAxiosError(err) && err.response) {
                // Mengambil pesan error dari backend Elysia kamu jika ada
                const serverMessage = err.response.data?.message;
                setError(serverMessage || 'Gagal mengambil data notifikasi');
            }
        }
    }, [user?.id]);

    // Fungsi wrapper untuk me-refresh kedua data sekaligus
    const refreshAll = useCallback(async () => {
        await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    }, [fetchNotifications, fetchUnreadCount]);

    // Efek otomatis berjalan setiap kali komponen di-mount atau user?.id berubah (Refresh halaman)
    useEffect(() => {
        if (user?.id) {
            refreshAll();
        }
    }, [user?.id, refreshAll]);

    const markAsRead = async (notifId: number) => {
        try {
            // 1. Kirim request ke backend Elysia
            const resMarkAsRead = await axios.patch(`${BACKEND_URL}/notif/${notifId}/mark-as-read`);
            console.log("resMarkAsRead.data", resMarkAsRead.data);
            if (resMarkAsRead.data.success) {
                // 2. Update list notifikasi lokal agar background/font berubah di UI saat itu juga
                setNotifications(prev =>
                    prev.map(notif => notif.id === notifId ? { ...notif, is_read: true } : notif)
                );

                // 3. Kurangi read
                setUnreadCount((prev) => prev - 1);
            }
        } catch (err) {
            elysiaErr(err);
            console.error("Gagal menandai notifikasi dibaca:", err);
        }
    };


    const markAllAsRead = async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const resMarkAll = await axios.patch(`${BACKEND_URL}/notif/mark-all-read/${user?.id}`);
            console.log("resMarkAll.data", resMarkAll.data);
            if (resMarkAll.data.success) {
                // Optimistic Update: Langsung ubah state lokal agar UI terasa instan tanpa nunggu fetch ulang
                setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
                // 2. Pemicu utama: Ubah jadi 0 useNotifStore Zustand Store
                setUnreadCount(0);
            }
        } catch (err) {
            elysiaErr(err); // debug
        } finally {
            setLoading(false);
        }
    };

    return {
        notifications, // dipakai NotifPage
        loading,
        error,
        refresh: refreshAll, // Expose fungsi ini untuk fitur "Refresh" manual di UI
        markAsRead,
        markAllAsRead,
        fetchUnreadCount
    };
};