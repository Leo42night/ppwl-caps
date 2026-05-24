import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAuthStore } from '../stores/useAuthStore';
import { useEffect, useState } from 'react';

// Loading API fetch/POST/PUT/DELETE
import { usePostStore } from '@/stores/usePostStore';
import { defAvatar } from '@/lib/utils';
import { useNotifStore } from '@/stores/useNotifStore';
import { useNotif } from '@/hooks/useNotif';
import PostFormModal from '@/components/post/PostFormModal';

export default function Layout() {
    const { isLoading } = useGoogleAuth();
    const { user, logout } = useAuthStore();
    const openCreateModal = usePostStore((s) => s.openCreateModal);
    const modalForm = usePostStore((s) => s.modalForm);
    const unreadCount = useNotifStore((s) => s.unreadCount);
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchUnreadCount } = useNotif();

    // Image Handler State (Gunakan fungsi inisialisasi agar fallback tidak di-encode ulang tiap render)
    const [imgSrc, setImgSrc] = useState(() => {
        const fallback = defAvatar(user?.name);
        return user?.avatar_url || fallback;
    });

    const isActive = (path: string) =>
        location.pathname === path;

    useEffect(() => {
        console.log("user", user); // buat cek aja, gk ngaruh logika
        // Periksa notifikasi
        fetchUnreadCount();
    }, [user, location]);

    // Efek untuk sinkronisasi gambar avatar saat user berubah
    useEffect(() => {
        const fallback = defAvatar(user?.name);
        setImgSrc(user?.avatar_url || fallback);
    }, [user?.avatar_url, user?.name]);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true })
    }

    if (isLoading) return <p>Memuat sesi anda...</p>;

    return (
        <>
            <div className="flex h-screen overflow-hidden font-sans bg-gray-50">
                {/* SIDEBAR */}
                <aside className="w-64 shrink-0 border-r bg-white p-5 flex flex-col gap-4">
                    <h2 className="text-xl font-bold">
                        Sosmed App
                    </h2>

                    {/* USER INFO */}
                    {user && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl bg-gray-100 p-3">
                            <img
                                src={imgSrc}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover border"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                    {user.name}
                                </span>
                                <span className="text-xs font-light italic">
                                    @{user.username}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {user.provider}
                                </span>
                            </div>
                        </div>
                    )}
                    <nav className="flex flex-col gap-2">

                        {/* HOME */}
                        <Link
                            to="/"
                            className={`rounded-lg px-3 py-2 transition ${isActive("/")
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            🏠 Home
                        </Link>

                        {/* ADD POST */}
                        <button
                            onClick={() => {
                                if (!user) navigate("/auth", { replace: true })
                                else openCreateModal()
                            }}
                            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                        >
                            ➕ Create Post
                        </button>

                        {/* NOTIFICATIONS */}
                        <Link
                            to="/notifications"
                            className={`rounded-lg px-3 py-2 transition ${isActive("/notifications")
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            🔔 Notifications ({unreadCount})
                        </Link>

                        {/* PROFILE */}
                        <Link
                            to="/profile"
                            className={`rounded-lg px-3 py-2 transition ${isActive("/profile")
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            👤 Profile
                        </Link>
                    </nav>

                    {/* LOGOUT */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="mt-auto rounded-lg bg-red-500 px-3 py-2 text-white font-semibold hover:bg-red-600 transition"
                        >
                            🚪 Logout
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/auth', { replace: true })}
                            className="mt-auto rounded-lg bg-red-500 px-3 py-2 text-white font-semibold hover:bg-red-600 transition"
                        >
                            🚪 Login
                        </button>
                    )}
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>

                {/* Modal Popup Form Post (add) (khusus halaman selain Homepage) */}
                {modalForm && !isActive("/") && <PostFormModal />}
            </div>
        </>
    );
}