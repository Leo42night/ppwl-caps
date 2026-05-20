interface NotifProps {
    text: string;
    time: string;
}

export default function Notif({ text, time }: NotifProps) {
    return (
        <div style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'between' }}>
            <span style={{ flex: 1 }}>{text}</span>
            <small style={{ color: '#888' }}>{time}</small>
        </div>
    );
}