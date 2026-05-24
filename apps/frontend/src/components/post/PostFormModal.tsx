// Create & Edit Post
import { usePost } from "@/hooks/usePost";
import { usePostStore } from "@/stores/usePostStore";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PostFormModal({
    fetch
}: {
    fetch?: () => void // HomePage & DetailPostPage
}) {
    const { createPost, updatePost } = usePost();
    const form = usePostStore((s) => s.form); // Create, Edit Modal
    const setForm = usePostStore((s) => s.setForm); // Create, Edit Modal
    const closeModal = usePostStore((s) => s.closeModal); // Create, Edit Modal
    const isEditMode = usePostStore((s) => s.isEditMode); // Create, Edit Modal
    const [content, setContent] = useState(form ? form.content : "");
    const [image, setImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSubmit = async (
        e?: React.SubmitEvent | React.KeyboardEvent
    ) => {
        e?.preventDefault();

        if (!content.trim()) return; // hanya content yg wajib, image opsional

        console.log({ content, image });
        setLoading(true);
        let newPostId: null | number = null;
        if (form && form.id) // edit mode -> updatePost
        {
            const resPostUpdate = await updatePost(form.id, content, image);
            console.log("resPostUpdate", resPostUpdate);
        } else {
            newPostId = await createPost(content, image);
        }
        if (fetch) fetch(); // load ulang data setelah create/update
        setLoading(false);
        setContent("");
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        closeModal();
        if (location.pathname !== '/') navigate(`/post/${newPostId}`)
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (form) {
            setForm((prev) => {
                const { image_url, ...rest } = prev;
                return rest;
            });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            {/* MODAL BOX */}
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
                <div className="max-h-[90vh] overflow-y-auto">
                    {/* HEADER */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold">
                            {isEditMode ? 'Edit' : 'Create'} Post
                        </h2>

                        <button
                            onClick={() => closeModal()}
                            className="text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>
                    </div>

                    {/* FORM */}
                    <form
                        onSubmit={handleSubmit}
                        className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >

                        {/* Textarea */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                // Shift + Enter => submit
                                if (e.shiftKey && e.key === "Enter") {
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Apa yang sedang kamu pikirkan?"
                            rows={4}
                            className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
                        />

                        {/* Upload Image */}
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Upload Gambar
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        setImage(file);
                                    }
                                }}
                                className="block w-full rounded-xl border border-gray-300 p-2 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white hover:file:opacity-90"
                            />
                        </div>

                        {/* Preview */}
                        {(image || form?.image_url) && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm text-gray-500">
                                    Preview Gambar
                                </p>

                                <div className="relative inline-block">
                                    <img
                                        src={
                                            image
                                                ? URL.createObjectURL(image)
                                                : form?.image_url
                                        }
                                        alt="preview"
                                        className="max-h-72 rounded-xl border object-cover"
                                    />

                                    {/* BUTTON CLOSE */}
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Shift + Enter untuk posting
                            </p>

                            <button
                                type="submit"
                                className="rounded-xl bg-black px-5 py-2 text-white transition hover:opacity-90"
                            >
                                {isEditMode ?
                                    (loading ? 'Updating...' : 'Update') :
                                    (loading ? 'Saving...' : 'Save')
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}