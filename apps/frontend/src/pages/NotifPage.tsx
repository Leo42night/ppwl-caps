import { useNotif } from '@/hooks/useNotif';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/types';
import { useNotifStore } from '@/stores/useNotifStore';

export default function NotifPage() {
    // Panggil hook dengan mengirimkan ID user aktif
    const navigate = useNavigate();
    const unreadCount = useNotifStore((s) => s.unreadCount);
    const { notifications, loading, error, refresh, markAsRead, markAllAsRead } = useNotif();

    const handleNotificationClick = async (
        e: React.MouseEvent<HTMLAnchorElement>,
        notif: Notification
    ) => {
        // 1. Cegah perilaku default tag <a> agar halaman tidak reload
        e.preventDefault();

        // 2. Tentukan URL tujuan terlebih dahulu
        const targetUrl = notif.post_id
            ? `/post/${notif.post_id}`
            : `/user/${notif.actor.username}`;

        try {
            // 3. Jalankan markAsRead jika notifikasi belum dibaca
            if (!notif.is_read) {
                await markAsRead(notif.id);
            }
        } catch (error) {
            console.error("Gagal mengubah status baca:", error);
        } finally {
            // 4. Lakukan navigasi menggunakan react-router-dom (tetap pindah halaman meski API error/sukses)
            navigate(targetUrl);
        }
    };


    if (loading) {
        return <div className="text-center py-10 text-gray-500">Memuat notifikasi...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 mb-2">{error}</p>
                <button onClick={refresh} className="text-sm bg-gray-200 px-3 py-1 rounded">Coba Lagi</button>
            </div>
        );
    }

    if (notifications.length === 0) {
        return <div className="text-center py-10 text-gray-400">Belum ada notifikasi baru.</div>;
    }

    return (
        <div className="max-w-md mx-auto divide-y divide-gray-100 bg-white shadow rounded-xl p-4">
            <div className="flex justify-between items-center pb-3">
                <h3 className="font-bold text-lg">Notifikasi</h3>
                <div className='flex gap-3'>
                    {/* Tombol hanya muncul jika ada notifikasi yang belum dibaca */}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="underline text-xs font-medium text-green-600 hover:text-green-700 transition"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                    <button onClick={refresh} className="underline text-xs text-green-600 hover:underline">Refresh</button>
                </div>
            </div>

            {notifications.map((notif) => (

                <a
                    key={notif.id}
                    href={notif.post_id ? `/post/${notif.post_id}` : `/user/${notif.actor.username}`}
                    onClick={(e) => handleNotificationClick(e, notif)}
                    // Tambahkan `block` atau `flex` agar seluruh area baris bisa diklik
                    className={`flex items-start gap-3 py-3.5 border-b border-gray-100 -mx-4 px-4 hover:bg-gray-100 transition-colors duration-150 
                            ${!notif.is_read ? 'bg-green-100/50' : ''}`}
                >
                    {/* Avatar Aktor */}
                    <img
                        src={notif.actor.avatar_url || 'https://placehold.co/40'}
                        alt={notif.actor.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                    />

                    {/* Konten Teks */}
                    <div className="flex-1 text-sm">
                        <p className="text-gray-900 leading-relaxed">
                            <span className="font-semibold text-gray-900 hover:underline">
                                {notif.actor.name}
                            </span>{' '}
                            <span className="text-gray-600">
                                {notif.type === 'like' && 'menyukai postingan Anda.'}
                                {notif.type === 'comment' && `mengomentari: "${notif.comment?.content}"`}
                                {notif.type === 'follow' && 'mulai mengikuti Anda.'}
                            </span>
                        </p>
                        <span className="text-xs text-gray-400 block mt-1">
                            {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </a>
            ))}
        </div>
    );
}