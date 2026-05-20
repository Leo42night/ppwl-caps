import Notif from '../components/Notif';

const dummyNotifs = [
    { id: 'n1', text: 'andi menyukai postingan Anda', time: '2 menit yang lalu' },
    { id: 'n2', text: 'riri mengomentari postingan Anda', time: '1 jam yang lalu' },
];

export default function NotifPage() {
    return (
        <div>
            <h2>Notifikasi</h2>
            <div style={{ border: '1px solid #eee', borderRadius: '8px' }}>
                {dummyNotifs.map(n => (
                    <Notif key={n.id} text={n.text} time={n.time} />
                ))}
            </div>
        </div>
    );
}