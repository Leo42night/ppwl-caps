import { useComment } from '@/hooks/useComment';
import { defAvatar } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePostStore } from '@/stores/usePostStore';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CommentModal = ({ fetchingPost }: { fetchingPost?: () => void }) => {
    const { user } = useAuthStore(); // untuk bar berisi user image di beranda
    const setModalComment = usePostStore((s) => s.setModalComment);
    const [textComment, setTextComment] = useState<string>('');
    const { createComment, loading, error } = useComment();
    const post = usePostStore((s) => s.post);
    const navigate = useNavigate();

    const handlePostComment = async () => {
        if (!textComment.trim()) return;

        // Panggil method dari hook
        await createComment({
            user_id: user!.id,
            comment: textComment
        }, (post_id) => {
            setTextComment('');      // 1. Kosongkan input text jika sukses
            setModalComment(false, null);  // 2. Tutup modal secara otomatis
            if (fetchingPost) fetchingPost();
            toast.success("Comment Added", {
                action: {
                    label: "View",
                    onClick: () => navigate(`/post/${post_id}`),
                },
            });
        });
    };

    return (
        <div className='fixed h-screen inset-0 bg-black/20 flex items-center justify-center z-50'>
            {/* Backdrop klik untuk menutup modal */}
            <div className='absolute inset-0' onClick={() => setModalComment(false, null)} />

            <div className='relative flex flex-col gap-4 p-4 bg-white rounded-2xl max-w-120 w-full z-10 shadow-lg'>

                {/* Bagian Atas: Detail Konten Post yang dikomentari */}
                <div className='flex gap-3 border-b pb-3 border-gray-100'>
                    <img
                        className='h-10 w-10 rounded-full object-cover'
                        src={post?.user?.avatar_url || defAvatar(post?.user?.name)}
                        alt=""
                    />
                    <div className='flex flex-col gap-1'>
                        <h4 className='font-bold text-sm text-gray-900'>
                            {post?.user?.name}
                        </h4>
                        <p className='text-sm text-gray-700'>{post?.content}</p>
                        {post?.image_url && (
                            <img src={post?.image_url} className='mt-2 rounded-xl max-h-40 object-cover w-full' />
                        )}
                    </div>
                </div>

                {/* Bagian Bawah: Form Input Komentar Kamu */}
                <div className='flex gap-3 items-start relative pb-12'>
                    <img
                        className='h-10 w-10 rounded-full object-cover'
                        src={post?.user?.avatar_url || defAvatar(post?.user?.name)}
                        alt=""
                    />
                    <div className='flex flex-col flex-1 gap-2'>
                        <h4 className='font-bold text-sm text-gray-900'>@{user?.username}</h4>
                        <input
                            type="text"
                            value={textComment} // Kunci nilai ke state lokal
                            onChange={(e) => setTextComment(e.target.value)} // Update state saat mengetik
                            placeholder='Masukkan komentar..'
                            className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50'
                            disabled={loading} // Disable input saat sedang loading API
                            onKeyDown={(e) => {
                                // Bonus: Jika menekan tombol Enter, otomatis submit komentar
                                if (e.key === 'Enter' && !loading) handlePostComment();
                            }}
                        />

                        {/* Tampilkan pesan error jika ada kesalahan dari backend */}
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

                        <button
                            onClick={handlePostComment}
                            disabled={loading || !textComment.trim()} // Cegah klik ganda / teks kosong
                            className='p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium text-sm rounded-xl absolute right-0 bottom-0 transition shadow-sm'
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommentModal