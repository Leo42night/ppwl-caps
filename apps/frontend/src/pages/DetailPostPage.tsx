import { useParams } from 'react-router-dom';
import Comment from '../components/post/Comment';
import { useEffect } from 'react';
import PostSingle from '@/components/post/PostSingle';
import { usePostStore } from '@/stores/usePostStore';
import CommentModal from '@/components/CommentModal';
import { usePost } from '@/hooks/usePost';
import PostFormModal from '@/components/post/PostFormModal';

export default function DetailPostPage() {
    const { id } = useParams();
    const { loading, fetchPost } = usePost();
    const modalForm = usePostStore((s) => s.modalForm);
    const modalComment = usePostStore((s) => s.modalComment);
    const post = usePostStore((s) => s.post);

    const fetchingPost = () => {
        if (id) {
            const postId = Number(id);
            fetchPost(postId);
        }
    }

    useEffect(() => {
        fetchingPost();
    }, [id]);

    return (
        post ? (
            <div>
                <a
                    href="/"
                    style={{ marginBottom: "15px" }}
                >
                    ⬅ Kembali
                </a>

                <h3>Detail Postingan</h3>
                <PostSingle post={post} />

                {/* List Comment */}
                <div style={{ marginTop: '20px', paddingLeft: '20px' }}>
                    <h4>Komentar ({post.comments?.length || 0})</h4>
                    {post.comments && post.comments.length > 0 && (
                        post.comments.map(comment => (
                            <Comment key={comment.id}
                                id={comment.id}
                                author={comment.user!.name}
                                text={comment.content}
                                fetchingPost={fetchingPost} />
                        ))
                    )}
                </div>

                {/* Comment Modal (Create & Edit) */}
                {modalComment && <CommentModal fetchingPost={fetchingPost}
                />}

                {/* Modal Popup Form Post (add,edit) (juga ada di HomePage) */}
                {modalForm && <PostFormModal fetch={fetchingPost} />}
            </div>
        ) : loading ? (
            <div className="flex items-center justify-center h-full">
                Loading...
            </div>
        ) : (
            <div className="flex items-center justify-center h-full">
                Post tidak ditemukan
            </div>
        )
    );
}