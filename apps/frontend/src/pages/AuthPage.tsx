import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useEmailAuth } from '../hooks/useEmailAuth'; // 1. Import hook baru

export default function AuthPage() {
    const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

    // 2. Gunakan hook email auth
    const { loginWithEmail, registerWithEmail, isLoading: isEmailLoading, errorData, successMessage } = useEmailAuth();

    const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);

    // State internal untuk menangkap value dari input form
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (isRegisterMode) {
            // Jalankan fungsi daftar
            const success = await registerWithEmail(formData.name, formData.username, formData.email, formData.password);
            if (success) {
                // Jika daftar sukses, pindahkan otomatis ke mode login biar user tinggal masuk
                setIsRegisterMode(false);
            }
            console.log("errorData?.property", errorData?.property?.endsWith('password'));
        } else {
            // Jalankan fungsi login
            await loginWithEmail(formData.email, formData.password);
        }
    };

    const isLoading = isGoogleLoading || isEmailLoading;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', gap: '20px' }}>

            <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px', width: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                    {isRegisterMode ? 'Buat Akun Baru' : 'Masuk ke Akun Anda'}
                </h3>

                {/* Tampilkan pesan error jika ada */}
                {errorData && <p style={{ color: 'red', fontSize: '13px', margin: '0 0 10px 0' }}>⚠️ {errorData.message}</p>}

                {/* Tampilkan pesan sukses jika registrasi berhasil */}
                {successMessage && <p style={{ color: 'green', fontSize: '13px', margin: '0 0 10px 0' }}>✅ {successMessage}</p>}

                {isRegisterMode && (
                    <>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nama Lengkap"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={errorData?.property === '/name' ? 'border-2 border-red-400' : ''}
                            style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className={errorData?.property === '/username' ? 'border-2 border-red-400' : ''}
                            style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </>
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={errorData?.property === '/email' ? 'border-2 border-red-400' : ''}
                    style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                />

                <div className="relative w-full mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full rounded border p-2 pr-10 ${errorData?.property?.endsWith("password")
                            ? "border-2 border-red-400"
                            : ""
                            }`}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', background: isRegisterMode ? 'green' : 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isLoading ? 'Memproses...' : isRegisterMode ? 'Daftar' : 'Login'}
                </button>

                <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
                    {isRegisterMode ? (
                        <span>
                            Sudah punya akun?{' '}
                            <button type="button" onClick={() => setIsRegisterMode(false)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                                Login di sini
                            </button>
                        </span>
                    ) : (
                        <span>
                            Belum punya akun?{' '}
                            <button type="button" onClick={() => setIsRegisterMode(true)} style={{ background: 'none', border: 'none', color: 'green', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                                Daftar di sini
                            </button>
                        </span>
                    )}
                </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', width: '300px', color: '#888', fontSize: '14px' }}>
                <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
                <span style={{ padding: '0 10px' }}>atau</span>
                <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
            </div>

            <button
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
                style={{ width: '300px', padding: '12px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}
            >
                {isLoading ? 'Memuat...' : '🚀 Masuk dengan Google'}
            </button>
        </div>
    );
}