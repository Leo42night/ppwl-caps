import type { Post } from '@/types';
import { create } from 'zustand';

// Tipe data untuk form post
interface PostForm { // data Post Update & Create (add/edit before submit)
    id?: number;
    content: string;
    image: File | null; // Untuk menghandle file upload asli
    image_url?: string; // Untuk preview gambar atau data url dari backend
}

interface PostState {
    posts: Post[]; // di homepage (tidak ada comments[], hanya _count.comment)
    post: Post | null; // ada detail comments[]
    form: PostForm;
    modalForm: boolean;
    isEditMode: boolean;
    modalComment: boolean;
    modalDelete: boolean;
    // Actions
    setPosts: (
        posts: Post[] | ((prev: Post[]) => Post[]) // bisa tambah data baru
    ) => void;
    setPost: (post: Post | null) => void;
    setForm: (
        fields:
            | Partial<PostForm>
            | ((prev: PostForm) => PostForm)
    ) => void;
    resetForm: () => void;
    openCreateModal: () => void;
    openEditModal: (post: { id: number; content: string; image_url?: string | null }) => void;
    closeModal: () => void;
    setModalComment: (state: boolean, post: Post | null) => void;
    setModalDelete: (state: boolean, post: Post | null) => void;
    updatePostData: (
        postId: number,
        updater: (post: Post) => Post
    ) => Post | null; // dipakai jika ada like baru
    rollbackPostData: (snapshot: Post) => void;
}

const initialForm: PostForm = {
    content: '',
    image: null,
    image_url: ''
};

export const usePostStore = create<PostState>((set, get) => ({
    posts: [],
    form: initialForm,
    postId: null,
    post: null,
    modalForm: false,
    isEditMode: false,
    modalComment: false,
    modalDelete: false,
    setPosts: (posts) =>
        set((state) => ({
            posts:
                typeof posts === "function"
                    ? posts(state.posts)
                    : posts,
        })),
    setPost: (post) => set({ post: post }),
    updatePostData: (postId, updater) => {
        const currentPost =
            get().posts.find((p) => p.id === postId) ??
            (get().post?.id === postId ? get().post : null);

        if (!currentPost) return null;

        const updatedPost = updater(currentPost);

        set((state) => ({
            posts: state.posts.map((p) =>
                p.id === postId ? updatedPost : p
            ),

            post:
                state.post?.id === postId
                    ? updatedPost
                    : state.post,
        }));

        // return snapshot untuk rollback
        return currentPost;
    },

    rollbackPostData: (snapshot) => {
        set((state) => ({
            posts: state.posts.map((p) =>
                p.id === snapshot.id ? snapshot : p
            ),

            post:
                state.post?.id === snapshot.id
                    ? snapshot
                    : state.post,
        }));
    },

    setForm: (
        updater: Partial<PostForm> | ((prev: PostForm) => PostForm)
    ) =>
        set((state) => ({
            form:
                typeof updater === "function"
                    ? updater(state.form)
                    : { ...state.form, ...updater },
        })),

    resetForm: () => set({ form: initialForm }),

    openCreateModal: () => set({
        modalForm: true,
        isEditMode: false,
        form: initialForm
    }),

    openEditModal: (post) => set({
        modalForm: true,
        isEditMode: true,
        form: {
            id: post.id,
            content: post.content,
            image: null, // File baru kosong sampai user memilih file baru
            image_url: post.image_url || ''
        }
    }),

    closeModal: () => set({ modalForm: false, isEditMode: false, form: initialForm }),

    setModalComment: (mode, post) => set({ modalComment: mode, post: post }),
    setModalDelete: (mode, post) => set({ modalDelete: mode, post: post })
}));