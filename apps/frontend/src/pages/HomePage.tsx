import Post from '../components/Post';

const dummyPosts = [
    { id: '1', author: 'budi_hartono', content: 'Hari ini cuaca cerah sekali ya!' },
    { id: '2', author: 'siti_wulandari', content: 'Lagi belajar React Router DOM nih, seru juga.' },
];

export default function HomePage() {
    return (
        <div>
            <h2>Beranda</h2>
            {dummyPosts.map(post => (
                <Post key={post.id} id={post.id} author={post.author} content={post.content} />
            ))}
        </div>
    );
}