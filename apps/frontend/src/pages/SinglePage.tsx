import { useParams, Link } from 'react-router-dom';
import Post from '../components/Post';
import Comment from '../components/Comment';

export default function SinglePage() {
    const { id } = useParams<{ id: string }>(); // Mengambil ID dari URL parameter

    // Simulasi fetch data berdasarkan ID
    const postData = { id: id || '1', author: 'budi_hartono', content: 'Hari ini cuaca cerah sekali ya!' };
    const dummyComments = [
        { id: 'c1', author: 'andi', text: 'Setuju bro!' },
        { id: 'c2', author: 'riri', text: 'Di sini malah mendung wkwk' },
    ];

    return (
        <div>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '15px' }}>⬅ Kembali ke Beranda</Link>

            <h3>Detail Postingan</h3>
            <Post id={postData.id} author={postData.author} content={postData.content} />

            <div style={{ marginTop: '20px', paddingLeft: '20px' }}>
                <h4>Komentar ({dummyComments.length})</h4>
                {dummyComments.map(comment => (
                    <Comment key={comment.id} author={comment.author} text={comment.text} />
                ))}
            </div>
        </div>
    );
}