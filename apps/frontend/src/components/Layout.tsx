import { Link, Outlet } from 'react-router-dom';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAuthStore } from '../stores/AuthStore';
import { useNotifStore } from '../stores/NotifStore';
import { useEffect, useRef, useState } from 'react';

function defAvatar(username: string | undefined) {
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(username || "") + "&background=FFEE00&color=000000&size=128";
}

export default function Layout() {
    const hasMounted = useRef(false);
    const { isLoading } = useGoogleAuth();
    const { user, logout } = useAuthStore();
    const unreadCount = useNotifStore((state) => state.unreadCount);

    // Image Handler State (Gunakan fungsi inisialisasi agar fallback tidak di-encode ulang tiap render)
    const [imgSrc, setImgSrc] = useState(() => {
        const fallback = defAvatar(user?.name);
        return user?.avatar_url || fallback;
    });

    useEffect(() => {
        if (hasMounted.current) return;
        hasMounted.current = true;
        console.log("user", user);
    }, [user]);

    // Efek untuk sinkronisasi gambar avatar saat user berubah
    useEffect(() => {
        const fallback = defAvatar(user?.name);
        setImgSrc(user?.avatar_url || fallback);
    }, [user?.avatar_url, user?.name]);

    if (isLoading) return <p>Memuat sesi anda...</p>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Sidebar Navigasi */}
            <aside style={{ width: '250px', background: '#f4f4f4', padding: '20px', borderRight: '1px solid #ddd' }}>
                <h2>Sosmed App</h2>
                <nav className='flex flex-col gap-3 items-baseline mb-4'>
                    <Link to="/">🏠 Home</Link>
                    {user ? (
                        <div>
                            <img
                                src={imgSrc}
                                alt={user.name}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="h-7 w-7 border-2 border-black object-cover"
                            />
                            <div>Halo, {user?.name}</div>
                            <div>Provider: {user?.provider}</div>
                            <div>🔔 Notifikasi ({unreadCount})</div>
                            <button onClick={logout}>Keluar</button>
                            <Link to="/notifications">🔔 Notifications</Link>
                            <Link to="/profile">👤 Profile</Link>
                        </div>
                    ) : (
                        <Link to="/auth">
                            <button>
                                Login
                            </button>
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Konten Utama */}
            <main style={{ flex: 1, padding: '20px' }}>
                <Outlet /> {/* Di sinilah HomePage, SinglePage, dll akan dirender */}
            </main>
        </div>
    );
}