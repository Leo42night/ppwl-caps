import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { usePostStore } from '../stores/usePostStore';
import { BACKEND_URL } from '@/constants';
import type { PostLike } from '@/types';
import { elysiaErr } from '@/lib/elysiaErr';

export const useLike = () => {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((s) => s.token);
    const updatePostData = usePostStore((s) => s.updatePostData); // change count like (add, delete)
    const rollbackPostData = usePostStore((s) => s.rollbackPostData); // change count like (add, delete)

    const [loading, setLoading] = useState(false);


    const toggleLike = async (postId: number, isCurrentlyLiked: boolean) => {
        if (!user) {
            alert("Silakan login terlebih dahulu!");
            return;
        }

        setLoading(true);

        const snapshot = updatePostData(postId, (post) => ({ // update post dan posts
            ...post,

            likes: isCurrentlyLiked
                ? post.likes?.filter((l) => l.user_id !== user.id) ?? []
                : [
                    ...(post.likes ?? []),
                    {
                        id: -1, // placeholder
                        post_id: postId,
                        user_id: user.id,
                        created_at: new Date(),
                    } as PostLike,
                ],
            _count: {
                ...post._count,
                likes: (post._count?.likes ?? 0) + (isCurrentlyLiked ? -1 : 1),
            }
        }));
        const existingLike = snapshot?.likes?.find(
            (l) => (l.user_id === user.id) && l.id !== -1
        );
        console.log({ user, isCurrentlyLiked, existingLike, snapshot }); // jika isCurrentlyLiked => artinya ingin di dislike, likes masih ada

        try {
            // unlike
            if (isCurrentlyLiked && existingLike) {
                await axios.delete(
                    `${BACKEND_URL}/post/like/${existingLike.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // like
            else {
                await axios.post(
                    `${BACKEND_URL}/post/${postId}/like`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } catch (error) {
            elysiaErr(error);
            if (snapshot) {
                rollbackPostData(snapshot);
            }
        } finally {
            setLoading(false);
        }
    };

    return { loading, toggleLike };
};