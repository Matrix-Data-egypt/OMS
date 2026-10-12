import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './BlogSection.css';
import { api, mediaUrl } from '../../api';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/api/blog/${id}`)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="blog-page-container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading…</div>;
  }

  if (error || !post) {
    return (
      <div className="blog-page-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p>{error || 'Post not found'}</p>
        <Link to="/blog">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-page-container">
      <article style={{ maxWidth: 780, margin: '0 auto', padding: '48px 20px 80px' }}>
        <Link to="/blog" className="blog-read-more-link" style={{ display: 'inline-block', marginBottom: 24 }}>
          ← Back to Blog
        </Link>
        <span className="blog-badge-purple">{post.date}</span>
        <h1 className="blog-main-heading" style={{ fontSize: '2.4rem', marginTop: 16 }}>{post.title}</h1>
        <div className="blog-card-meta-row" style={{ margin: '16px 0 28px' }}>
          <span className="blog-author-name">By {post.author}</span>
          <span className="blog-read-time">{post.readTime}</span>
        </div>
        {post.img && (
          <img
            src={mediaUrl(post.img)}
            alt={post.title}
            style={{ width: '100%', borderRadius: 16, marginBottom: 32, maxHeight: 420, objectFit: 'cover' }}
          />
        )}
        <div
          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: '1.05rem', color: 'inherit' }}
        >
          {post.content}
        </div>
      </article>
    </div>
  );
}
