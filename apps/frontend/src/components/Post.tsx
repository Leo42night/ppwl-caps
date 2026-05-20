import { Link } from 'react-router-dom';

interface PostProps {
    id: string;
    author: string;
    content: string;
}

export default function Post({ id, author, content }: PostProps) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4>@{author}</h4>
            <p>{content}</p>
            {/* Link menuju SinglePage berdasarkan ID post */}
            <Link to={`/post/${id}`} style={{ color: 'blue', textDecoration: 'none' }}>
                Lihat Selengkapnya & Komentar
            </Link>
        </div>
    );
}