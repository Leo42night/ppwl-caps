import PostSingle from '../components/post/PostSingle';
import { useAuthStore } from '@/stores/useAuthStore';
import { defAvatar } from '@/lib/utils';
import { usePost } from '@/hooks/usePost';
import { usePostStore } from '@/stores/usePostStore';
import { useEffect } from 'react';
import CommentModal from '@/components/CommentModal';
import DeletePostDialog from '@/components/post/DeletePostDialog';
import PostFormModal from '@/components/post/PostFormModal';

export default function HomePage() {
    const user = useAuthStore((s) => s.user); // untuk bar berisi user image di beranda
    // 1. Konsumsi Hooks Operasi API
    const { loading, fetchPosts, error } = usePost(); // posts otomatis di load ketika mount
    // 2. Konsumsi Zustand Store untuk State Modal & Form
    const posts = usePostStore((s) => s.posts);
    const openCreateModal = usePostStore((s) => s.openCreateModal);
    const modalForm = usePostStore((s) => s.modalForm); // create & update
    const modalDelete = usePostStore((s) => s.modalDelete);
    const modalComment = usePostStore((s) => s.modalComment);


    // Jalankan fetch HANYA ketika halaman Beranda dimuat
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // jika loading tampilkan elemen skeleton
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                Loading...
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                Tidak ada Postingan
            </div>
        );
    }

    return (
        <div>
            <h2>Beranda</h2>
            {user && (
                // Bar Pemicu Form Post (Mirip Twitter/Facebook)
                <div
                    onClick={openCreateModal} // Menggunakan action Zustand
                    className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex items-center gap-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition duration-150"
                >
                    {/* Circle Image User.Avatar */}
                    <img
                        src={user?.avatar_url || defAvatar(user?.name)}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 shrink-0"
                    />

                    {/* Form Input (Tiruan/Fake Input) */}
                    <div className="flex-1 bg-gray-50 text-gray-400 hover:bg-gray-100/80 rounded-xl px-4 py-2.5 text-sm transition-colors duration-150">
                        What's new?
                    </div>

                    {/* Button "Post" */}
                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm rounded-xl shadow-sm transition duration-150 shrink-0"
                    >
                        Post
                    </button>
                </div>
            )}

            {/* ERROR / LOADING INDICATOR LIST POSTS */}
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-xl">{error}</div>}
            {loading && <div className="text-center py-6 text-gray-500">Memuat data...</div>}

            {/* DAFTAR POSTINGAN */}
            <div className="space-y-4">
                {posts.map((post: any) => (
                    // Berikan akses onEdit ke komponen Post agar bisa membuka modal edit
                    <PostSingle key={post.id} post={post} />
                ))}
            </div>

            {/* Modal Popup Form Post (add,edit) (juga ada di HomePage) */}
            {modalForm && <PostFormModal fetch={fetchPosts} />}

            {/* Comment Modal (ada di homepage & detailPost) */}
            {modalComment && <CommentModal />}

            {/* Delete Modal (ada di homepage & detailPost) */}
            {modalDelete &&
                <DeletePostDialog fetchPosts={fetchPosts} />
            }
        </div>
    );
}

