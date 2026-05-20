import { useState } from 'react';

export default function ProfilePage() {
    const [password, setPassword] = useState({ old: '', new: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Password berhasil diubah!');
        setPassword({ old: '', new: '' });
    };

    return (
        <div>
            <h2>Profil Saya</h2>
            <div style={{ maxWidth: '400px', marginTop: '20px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4>Ubah Password</h4>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password Lama</label>
                        <input
                            type="password"
                            value={password.old}
                            onChange={e => setPassword({ ...password, old: e.target.value })}
                            style={{ width: '100%', padding: '8px' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password Baru</label>
                        <input
                            type="password"
                            value={password.new}
                            onChange={e => setPassword({ ...password, new: e.target.value })}
                            style={{ width: '100%', padding: '8px' }}
                            required
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Simpan Perubahan
                    </button>
                </form>
            </div>
        </div>
    );
}