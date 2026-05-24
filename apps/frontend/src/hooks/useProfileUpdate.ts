import { useState } from "react";
import axios from "axios";
import type { User } from "@/types";
import { BACKEND_URL } from "@/constants";
import { elysiaErr } from "@/lib/elysiaErr";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

export default function useProfileUpdate() {
    const [loading, setLoading] = useState(false);
    const [errorData, setErrorData] = useState<any>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const token = useAuthStore((s) => s.token);

    const updateProfile = async (profile: User, password: { old: string, new: string }) => {
        try {
            setLoading(true);
            setErrorData(null);
            setSuccess(false);

            const formData = new FormData();

            formData.append("name", profile.name);
            formData.append("username", profile.username);
            formData.append("email", profile.email);
            if (profile.bio) formData.append("bio", profile.bio);
            if (profile.image) formData.append("image", profile.image); // type file
            // Tambahkan pengecekan jika user memang ingin mengubah password
            if (password.old) formData.append("old_password", password.old);
            if (password.new) formData.append("new_password", password.new);
            const response = await axios.put(
                `${BACKEND_URL}/profile/${profile.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setSuccess(true);
            toast.success(response.data.message);
            return response.data;
        } catch (err: any) {
            elysiaErr(err); // DEV: pesan di console
            setErrorData(err?.response?.data);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateProfile,
        loading,
        errorData,
        success,
    };
}