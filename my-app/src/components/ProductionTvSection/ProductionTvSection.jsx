import React, { useState, useEffect, useMemo } from 'react';
import './ProductionTvSection.css';
import { api, mediaUrl } from '../../api';

const VIDEO_CATEGORIES = [
  'Furniture',
  'Electronics',
  'Food and Beverages',
  'Real Estate',
  'Cosmetics',
  'Pharmaceutical',
  'Clothes',
  'Paints',
  'Banking and Finance',
];

// Helper to extract YouTube video ID
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

// Helper to get high-quality YouTube thumbnail
function getVideoThumbnail(item) {
  if (item.thumbnail && item.thumbnail.trim()) {
    return item.thumbnail.startsWith('http')
      ? item.thumbnail
      : mediaUrl(item.thumbnail);
  }
  const ytId = getYouTubeId(item.youtubeUrl || item.embedUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return '';
}

export default function ProductionTvSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModalVideo, setActiveModalVideo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api('/api/videos')
      .then((data) => {
        if (!cancelled) setVideos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setVideos([]);
          setError(err.message || 'Failed to load videos');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveModalVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Top 5 Latest Videos (أحدث 5 فيديوهات)
  const latestVideos = useMemo(() => {
    return videos.slice(0, 5);
  }, [videos]);

  // Group videos by category
  const videosByCategory = useMemo(() => {
    const normalize = (value) =>
      String(value || '')
        .replace(/&amp;/gi, '&')
        .replace(/^Food\s*&\s*Beverages\$/i, 'Food and Beverages')
        .trim();

    return VIDEO_CATEGORIES.map((category) => ({
      category,
      items: videos.filter((v) => normalize(v.category) === category),
    })).filter((group) => group.items.length > 0);
  }, [videos]);

  const uncategorized = useMemo(() => {
    const normalize = (value) =>
      String(value || '')
        .replace(/&amp;/gi, '&')
        .replace(/^Food\s*&\s*Beverages\$/i, 'Food and Beverages')
        .trim();

    return videos.filter(
      (v) => !v.category || !VIDEO_CATEGORIES.includes(normalize(v.category))
    );
  }, [videos]);

  const handleCardClick = (item) => {
    setActiveModalVideo(item);
  };

  const renderVideoCard = (item, isFeatured = false) => {
    const thumb = getVideoThumbnail(item);

    return (
      <div
        key={item.id}
        className={`prod-video-card ${isFeatured ? 'is-featured-card' : ''}`}
        onClick={() => handleCardClick(item)}
        role="button"
        tabIndex={0}
      >
        <div className="prod-thumb-container">
          {thumb ? (
            <img
              src={thumb}
              alt={item.title}
              className="prod-thumb-img"
              loading="lazy"
            />
          ) : item.fileUrl ? (
            <video
              src={mediaUrl(item.fileUrl)}
              className="prod-thumb-img"
              muted
            />
          ) : (
            <div className="prod-thumb-blank">
              <span>OMS Production</span>
            </div>
          )}

          <div className="prod-play-overlay">
            <div className="prod-play-icon">▶</div>
          </div>

          {item.brand && (
            <span className="prod-card-brand-pill">{item.brand}</span>
          )}
        </div>

        <div className="prod-card-meta">
          <h4 className="prod-card-title">{item.title}</h4>
          {item.category && (
            <span className="prod-card-category">{item.category}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="prod-tv-container">
      {/* 1. Header */}
      <section className="prod-tv-header">
        <h1 className="prod-main-title">
          OMS Production <span className="prod-text-italic">TV Station.</span>
        </h1>
        <p className="prod-subtext">
          Where commercial fire meets premium cinematic discipline. Explore high-intent video storytelling assets engineered for national and global brand impact.
        </p>
      </section>

      {/* 2. Top 5 Latest Premieres (أحدث 5 فيديوهات جنب بعض بمسافات مضبوطة) */}
      <section className="prod-latest-showcase-section">
        <div className="prod-section-header-row">
          <div>
            <span className="prod-section-tag">LATEST PREMIERES</span>
            <h2 className="prod-section-title">أحدث 5 أعمال تم إنتاجها</h2>
          </div>
          <span className="prod-count-pill">{latestVideos.length} Videos</span>
        </div>

        {loading && <p className="prod-status-note">Loading broadcast reels…</p>}
        {!loading && error && <p className="prod-error-note">{error}</p>}
        {!loading && !error && latestVideos.length === 0 && (
          <p className="prod-status-note">No broadcast videos uploaded yet.</p>
        )}

        {latestVideos.length > 0 && (
          <div className="prod-top5-grid">
            {latestVideos.map((video) => renderVideoCard(video, true))}
          </div>
        )}
      </section>

      {/* 3. Categories Archive (فيديوهات كل فئة جنب بعض بمقاس مناسب) */}
      <section className="prod-categories-section">
        <div className="prod-archive-header">
          <span className="prod-section-tag">CATEGORIZED REELS</span>
          <h2 className="prod-section-title">فئات الإنتاج والأعمال التلفزيونية</h2>
        </div>

        {videosByCategory.map(({ category, items }) => (
          <div key={category} className="prod-category-block">
            <div className="prod-category-heading">
              <h3 className="prod-category-name">{category}</h3>
              <span className="prod-category-badge">{items.length} Videos</span>
            </div>
            <div className="prod-category-grid">
              {items.map((item) => renderVideoCard(item, false))}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="prod-category-block">
            <div className="prod-category-heading">
              <h3 className="prod-category-name">Other Commercials</h3>
              <span className="prod-category-badge">{uncategorized.length} Videos</span>
            </div>
            <div className="prod-category-grid">
              {uncategorized.map((item) => renderVideoCard(item, false))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Cinema Video Player Modal */}
      {activeModalVideo && (
        <div
          className="prod-modal-backdrop"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="prod-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="prod-modal-close-btn"
              onClick={() => setActiveModalVideo(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="prod-modal-player-viewport">
              {activeModalVideo.type === 'youtube' && activeModalVideo.embedUrl ? (
                <iframe
                  src={`${activeModalVideo.embedUrl}?autoplay=1&rel=0`}
                  title={activeModalVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="prod-modal-iframe"
                />
              ) : activeModalVideo.fileUrl ? (
                <video
                  src={mediaUrl(activeModalVideo.fileUrl)}
                  controls
                  autoPlay
                  className="prod-modal-iframe"
                />
              ) : (
                <div className="prod-thumb-blank" style={{ height: '100%' }}>
                  <span>Video source unavailable</span>
                </div>
              )}
            </div>

            <div className="prod-modal-meta">
              <div className="prod-modal-top-row">
                {activeModalVideo.brand && (
                  <span className="prod-modal-brand-badge">
                    {activeModalVideo.brand}
                  </span>
                )}
                {activeModalVideo.category && (
                  <span className="prod-modal-cat-tag">
                    {activeModalVideo.category}
                  </span>
                )}
              </div>
              <h3 className="prod-modal-title">{activeModalVideo.title}</h3>
              {activeModalVideo.desc && (
                <p className="prod-modal-desc">{activeModalVideo.desc}</p>
              )}

              {activeModalVideo.youtubeUrl && (
                <a
                  href={activeModalVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prod-modal-yt-btn"
                >
                  Watch on YouTube ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
