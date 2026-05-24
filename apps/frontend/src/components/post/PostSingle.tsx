import { useAuthStore } from '@/stores/useAuthStore';
import { usePostStore } from '@/stores/usePostStore';
import type { Post } from '@/types';

// Popup Edit/delete
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from 'react';
import { Ellipsis, Heart, MessageCircle } from 'lucide-react';
import { defAvatar } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useLike } from '@/hooks/useLike';

interface PostSingleProps {
    post: Post;
}

export default function PostSingle({ post }: PostSingleProps) {
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null); // popover edit, delete
    const openEditModal = usePostStore((s) => s.openEditModal);
    const setModalComment = usePostStore((s) => s.setModalComment);
    const setModalDelete = usePostStore((s) => s.setModalDelete);

    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    // console.log(location.pathname);
    // LIKE
    const { toggleLike } = useLike();
    const isLiked = post.likes?.some(l => l.user_id === user?.id) ?? false;

    const handlePostClick = () => {
        console.log("element click")
        navigate(`/post/${post.id}`, { replace: true });
    }

    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // <-- Menghentikan rambatan klik ke induk (handlePostClick)
        console.log("Avatar diklik!");
    }
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // <-- Menghentikan rambatan klik ke induk (handlePostClick)
        console.log("Gambar diklik!");
    }

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleLike(post.id, isLiked); // tidak perlu pass setPost lagi
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // <-- KUNCINYA: Menghentikan rambatan klik ke induk
        console.log("buka popup form comment!", post);
        setModalComment(true, post);
    };
    return (
        <>
            <div
                onClick={handlePostClick}
                style={{
                    border: "1px solid #ccc",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                }}
            >
                {/* Header */}
                <div className='flex justify-between'>
                    <div className='flex gap-2'>
                        <img
                            onClick={handleAvatarClick}
                            src={post.user?.avatar_url || defAvatar(post.user?.name)}
                            alt={post.user?.name}
                            className="h-10 w-10 rounded-full object-cover border"
                        />
                        {/* Name */}
                        <span className="font-bold text-sm">
                            @{post.user?.name}
                        </span>
                    </div>

                    {/* 3 Dot Option Edit/Delete */}
                    {user?.id === post.user_id && (
                        <Popover
                            open={openPopoverId === post.id}
                            onOpenChange={(open) => {
                                setOpenPopoverId(open ? post.id : null);
                            }}
                        >
                            {/* stopPropagation cegah parent click */}
                            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                {/* Button titik 3 */}
                                <Ellipsis rotate={90} size={20} />
                            </PopoverTrigger>
                            <PopoverContent align="end" className="flex flex-col gap-2"
                                onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        openEditModal(post);

                                        // close popover
                                        setOpenPopoverId(null);
                                    }}
                                    className="rounded-lg bg-yellow-500 px-3 py-1 text-white hover:opacity-90"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => {
                                        // close popover
                                        setOpenPopoverId(null);
                                        // TODO: delete logic
                                        setModalDelete(true, post);
                                    }}
                                    className="rounded-lg bg-red-500 px-3 py-1 text-white hover:opacity-90"
                                >
                                    Delete
                                </button>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                <p>{post.content}</p>

                {/* IMAGE */}
                {post.image_url && (
                    <img
                        onClick={handleImageClick}
                        src={post.image_url}
                        className="mt-3 max-h-96 w-full rounded-lg object-cover"
                    />
                )}

                {/* ACTIONS (LIKE & COMMENT BUTTONS) */}
                <div className="flex items-center gap-6 text-gray-500">

                    {/* BUTTON LIKE */}
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-2 text-sm font-medium transition duration-150 group p-1 rounded-lg ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'
                            }`}
                    >
                        <div className={`p-1.5 rounded-full group-hover:bg-pink-50 transition ${isLiked ? 'bg-pink-50' : ''}`}>
                            <Heart
                                size={18}
                                className={`transition-transform duration-150 active:scale-125 ${isLiked ? 'fill-pink-600 stroke-pink-600' : ''}`}
                            />
                        </div>
                        <span>{post._count?.likes || 0}</span>
                    </button>

                    {/* BUTTON COMMENT */}
                    <button
                        onClick={handleCommentClick}
                        className="flex items-center gap-2 text-sm font-medium hover:text-blue-500 transition duration-150 group p-1 rounded-lg"
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition">
                            <MessageCircle size={18} />
                        </div>
                        <span>{post._count?.comments || 0}</span>
                    </button>
                </div>
            </div>
        </>
    );
}