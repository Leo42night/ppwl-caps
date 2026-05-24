import { useState, useCallback } from 'react';
import axios from 'axios';
import { usePostStore } from '../stores/usePostStore';
import { BACKEND_URL } from '@/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { elysiaErr } from '@/lib/elysiaErr';
import type { Post } from '@/types';

export const usePost = () => {
    const [loading, setLoading] = useState<boolean>(true); // default true agar langsung loading saat di mount
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const form = usePostStore((s) => s.form);
    const setPost = usePostStore((s) => s.setPost);
    const setPosts = usePostStore((s) => s.setPosts);
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    // Ambil token dari localStorage
    const token = useAuthStore((s) => s.token);

    // 1. Ambil Semua Postingan
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resFetchPosts = await axios.get(`${BACKEND_URL}/data/posts`, {
                headers: {
                    ...(isAuthenticated && { Authorization: `Bearer ${token}` })
                }
            });
            console.log("resFetchPosts.data", resFetchPosts.data);
            setPosts(resFetchPosts.data.data);
        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal memuat postingan');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPost = async (id: number) => {
        setLoading(true);
        try {
            const resPost = await axios.get(
                `${BACKEND_URL}/data/post/${id}`, // post, author, comment[]
                {
                    headers: {
                        ...(isAuthenticated && { Authorization: `Bearer ${token}` })
                    }
                }
            );
            console.log("resPost", resPost);
            const dataPost: Post | null = resPost.data.data;
            setPost(dataPost || null);
        } catch (error) {
            elysiaErr(error);
        } finally {
            setLoading(false);
        }
    }

    // 2. Buat Postingan Baru
    const createPost = async (
        content: string,
        image: File | null
    ) => {
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append("user_id", String(user!.id)); // form data tidak bisa number
        formData.append('content', content);
        if (image) {
            formData.append('image', image); // Field nama 'image' dicocokkan dengan backend Elysia
        }

        try {
            const resCreatePost = await axios.post(`${BACKEND_URL}/post`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log({ ...resCreatePost.data.data, user });
            // Optimistic Update: Masukkan postingan baru ke urutan teratas state lokal
            setSuccess(true);
            if (resCreatePost.data.data) {
                setPosts((prev) => [{ ...resCreatePost.data.data, user }, ...prev]);
                return resCreatePost.data.data.id;
            }
        } catch (err: any) {
            elysiaErr(err);
            setError(err.response?.data?.message || 'Gagal membuat postingan');
        }
    };

    // 3. Update Postingan Berdasarkan ID
    const updatePost = async (id: number, content: string, image: File | null) => {
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image_new', image);
        }
        if (!form.image_url) formData.append('remove_image', 'yes');

        try {
            console.log("updatePost", { form, id, image });
            const resUpPost = await axios.patch(`${BACKEND_URL}/post/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("resUpPost", resUpPost);

            // Update data postingan di state lokal tanpa reload halaman
            setPosts((prev) =>
                prev.map((p) => p.id === id ? resUpPost.data.data : p)
            );
            setSuccess(true);
        } catch (err: any) {
            elysiaErr(err)
            setError(err.response?.data?.message || 'Gagal memperbarui postingan');
        }
    };

    return {
        error,
        success,
        loading,
        setSuccess, // Untuk reset state success manual jika dibutuhkan
        fetchPosts, // [Beranda]
        fetchPost, // [Single Post]
        createPost,
        updatePost
    };
};