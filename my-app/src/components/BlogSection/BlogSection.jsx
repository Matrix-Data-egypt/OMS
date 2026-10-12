import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogSection.css';
import { api, mediaUrl } from '../../api';

export default function BlogSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/blog')
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="blog-page-container">
      <section className="blog-hero-header">
        <span className="blog-badge-purple">OMS Insights & Intelligence</span>
        <h1 className="blog-main-heading">OMS Blog <span className="blog-italic-text">Station.</span></h1>
        <p className="blog-sub-description">
          Stay ahead of fragmented media chaos. Explore professional insights, campaign breakdowns, and strategic industry analysis curated by our leading squad thinkers.
        </p>
      </section>

      <section className="blog-grid-section">
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading articles…</p>}
        {error && <p style={{ textAlign: 'center', color: '#c44' }}>{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888' }}>No articles published yet.</p>
        )}

        <div className="blog-articles-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-article-card">
              <div className="blog-card-image-box">
                {post.img ? (
                  <img src={mediaUrl(post.img)} alt={post.title} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#1a1a2e' }} />
                )}
                <span className="blog-card-date-badge">{post.date}</span>
              </div>

              <div className="blog-card-content-box">
                <div className="blog-card-meta-row">
                  <span className="blog-author-name">By {post.author}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>
                
                <h3 className="blog-card-title-text">{post.title}</h3>
                <p className="blog-card-description-text">{post.desc}</p>
                
                <Link to={`/blog/${post.id}`} className="blog-read-more-link">
                  Read Full Article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
