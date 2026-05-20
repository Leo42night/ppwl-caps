interface CommentProps {
    author: string;
    text: string;
}

export default function Comment({ author, text }: CommentProps) {
    return (
        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px', marginTop: '8px' }}>
            <strong>@{author}:</strong> <span>{text}</span>
        </div>
    );
}