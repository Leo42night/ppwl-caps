// import Spinner from '@/components/Spinner';
import useProfileUpdate from '@/hooks/useProfileUpdate';
import { defAvatar } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types';
import { useState } from 'react';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const {
        updateProfile,
        loading,
        errorData
    } = useProfileUpdate();

    // State untuk menyimpan data profil pengguna
    const [profile, setProfile] = useState<User>(user ?? {
        id: 0,
        name: "",
        username: "",
        email: ""
    });

    // State terpisah untuk password demi keamanan
    const [password, setPassword] = useState({ old: '', new: '' });

    // Handle perubahan input text biasa
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    // Handle simulasi upload avatar
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setProfile(prev => ({ ...prev, avatar_url: imageUrl, image: file }));
        }
    };

    // Handle submit form
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        // Di sini kamu bisa menambahkan logika API call untuk menyimpan perubahan
        const resUpProfile = await updateProfile(profile, password);
        console.log({ resUpProfile });
        if (resUpProfile.user) {
            setUser(resUpProfile.user);
            setPassword({ old: '', new: '' });
            setProfile(prev => { // hapus image
                const { image, ...rest } = prev;
                return rest;
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            {loading && <div>Loading...</div>}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

                {/* Judul Halaman */}
                <div className="border-b border-gray-100 pb-5 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profil Saya</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
                </div>

                {/* Error */}
                {errorData && <p style={{ color: 'red', fontSize: '13px', margin: '0 0 10px 0' }}>⚠️ {errorData.message}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Bagian Ganti Avatar */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100">
                        <div className="relative group">
                            <img
                                src={profile.avatar_url ?? defAvatar(profile.name)}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-green-50"
                            />
                        </div>
                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                                Ganti Foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                            <span className="text-xs text-gray-400">Format: JPG, PNG. Maksimal 2MB.</span>
                        </div>
                    </div>

                    {/* Bagian Informasi Dasar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                required
                                className={`${errorData?.property === "/name"
                                    ? "border-2 border-red-400"
                                    : "border border-gray-300"
                                    } w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                onChange={handleChange}
                                required
                                className={`${errorData?.property === "/username"
                                    ? "border-2 border-red-400"
                                    : "border border-gray-300"
                                    } w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm`}
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Bagian Keamanan / Password */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-3">Ubah Password</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                                <input
                                    type="password"
                                    value={password.old}
                                    onChange={e => setPassword({ ...password, old: e.target.value })}
                                    className={`${errorData?.property === "/old_password"
                                        ? "border-2 border-red-400"
                                        : "border border-gray-300"
                                        } w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm`}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                <input
                                    type="password"
                                    value={password.new}
                                    onChange={e => setPassword({ ...password, new: e.target.value })}
                                    className={`${errorData?.property === "/new_password"
                                        ? "border-2 border-red-400"
                                        : "border border-gray-300"
                                        } w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm`}
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tombol Simpan */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {loading ? 'Menyimpan..' : 'Simpan Perubahan'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}