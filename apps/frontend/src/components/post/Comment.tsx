import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Ellipsis, Trash2, X, Loader2 } from 'lucide-react';
import { defAvatar } from '@/lib/utils';
import { useAuthStore } from "@/stores/useAuthStore";
import { useComment } from "@/hooks/useComment";

interface CommentProps {
    author: string;
    id: number;
    text: string;
    fetchingPost: () => void;
}

export default function Comment({ author, id, text, fetchingPost }: CommentProps) {
    const user = useAuthStore((s) => s.user);

    // GABUNGKAN instansiasi hook jadi satu baris agar sinkron!
    const { editComment, deleteComment, loading, error, setError } = useComment();

    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
    const [commentEdit, setCommentEdit] = useState<string | null>(null);
    const [deleteCommentData, setDeleteCommentData] = useState<{
        id: number;
        comment: string;
    } | null>(null);

    const handleUpdateComment = async () => {
        // Jika kosong atau hanya spasi, set error lokal agar user tahu
        if (!commentEdit || !commentEdit.trim()) {
            setError("Komentar tidak boleh kosong!");
            return;
        }

        // Jalankan API editComment menggunakan instans yang sama
        await editComment(id, commentEdit, () => {
            setCommentEdit(null); // Tutup modal edit jika sukses murni dari API
            fetchingPost(); // Muat ulang postingan agar teks terbaru muncul
        });
    }

    const handleDeleteComment = async () => {
        if (!deleteCommentData) return;

        await deleteComment(deleteCommentData.id);
        setDeleteCommentData(null); // Tutup modal delete
        fetchingPost(); // Refresh list data
    }

    return (
        <div className="flex justify-between p-3 border rounded-xl items-center bg-white shadow-sm mb-2">
            <div>
                <strong className="text-sm text-gray-900">@{author}:</strong> <span className="text-sm text-gray-700">{text}</span>
            </div>

            <Popover
                open={openPopoverId === id}
                onOpenChange={(open) => setOpenPopoverId(open ? id : null)}
            >
                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                        <Ellipsis rotate={90} size={20} />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="flex flex-col gap-1 p-1.5 w-32" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => {
                            setCommentEdit(text);
                            setOpenPopoverId(null);
                        }}
                        className="rounded-lg text-left px-3 py-1.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => {
                            setOpenPopoverId(null);
                            setDeleteCommentData({ id, comment: text });
                        }}
                        className="rounded-lg text-left px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        Delete
                    </button>
                </PopoverContent>
            </Popover>

            {/* Edit Modal */}
            {commentEdit !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl flex gap-3 items-start">
                        <img
                            className='h-10 w-10 rounded-full object-cover border'
                            src={user?.avatar_url || defAvatar(user?.name)}
                            alt=""
                        />
                        <div className='flex flex-col flex-1 gap-3 relative pb-12'>
                            <div>
                                <h4 className='font-bold text-sm text-gray-900'>Kamu</h4>
                                <p className="text-xs text-gray-400 mb-2">Mengedit komentar...</p>
                            </div>
                            <input
                                type="text"
                                value={commentEdit}
                                onChange={(e) => setCommentEdit(e.target.value)}
                                placeholder='Masukkan komentar baru..'
                                className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50'
                                disabled={loading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !loading) handleUpdateComment();
                                }}
                            />

                            {error && <p className="text-xs text-red-500">{error}</p>}

                            <div className="absolute right-0 bottom-0 flex gap-2">
                                <button
                                    onClick={() => {
                                        setCommentEdit(null);
                                        setError(null); // Bersihkan error saat batal
                                    }}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl"
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpdateComment}
                                    disabled={loading || !commentEdit.trim()}
                                    className='px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium text-sm rounded-xl flex items-center gap-1 shadow-sm'
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteCommentData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Hapus Komentar?</h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Komentar <span className="font-semibold text-gray-800">"{deleteCommentData.comment}"</span> akan dihapus permanen.
                                </p>
                            </div>
                            <button
                                onClick={() => setDeleteCommentData(null)}
                                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteCommentData(null)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteComment}
                                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                disabled={loading}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}