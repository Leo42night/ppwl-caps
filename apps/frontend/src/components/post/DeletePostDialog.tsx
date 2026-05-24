import { useEffect, useState } from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from 'sonner';
import { BACKEND_URL } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { elysiaErr } from "@/lib/elysiaErr";
import { usePostStore } from "@/stores/usePostStore";

export default function DeletePostDialog({
    fetchPosts
}: { fetchPosts: () => void }) {
    const [loading, setLoading] = useState(false);
    const token = useAuthStore((s) => s.token);
    const navigate = useNavigate();
    const post = usePostStore((s) => s.post);
    const setPost = usePostStore((s) => s.setPost);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setPost(null);
            }
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const handleDelete = async () => {
        if (!token) navigate('/auth', { replace: true });
        try {
            setLoading(true);
            const resDelPost = await axios.delete(`${BACKEND_URL}/post/${post?.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            console.log("resDelPost.data", resDelPost.data);
            toast(`Post berhasil dihapus`);
            setPost(null);
            navigate('/', { replace: true });
            fetchPosts(); // reload ulang post
        } catch (error) {
            elysiaErr(error);
            console.error("Delete post failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        post && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                    {/* HEADER */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Hapus Postingan?
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Post
                                {post.content ? (
                                    <span className="font-semibold text-black">
                                        {` "${post.content}" `}
                                    </span>
                                ) : (
                                    " ini "
                                )}
                                akan dihapus permanen dan tidak dapat dikembalikan.
                            </p>
                        </div>

                        <button
                            onClick={() => setPost(null)}
                            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setPost(null)}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Batal
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Ya, Hapus
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}