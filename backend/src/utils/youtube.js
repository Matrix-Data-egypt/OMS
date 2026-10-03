function toYouTubeEmbed(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed.split('?')[0];
  }

  const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = trimmed.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  return null;
}

function isYouTubeUrl(url) {
  return /youtu(\.be|be\.com)/i.test(url || '');
}

module.exports = { toYouTubeEmbed, isYouTubeUrl };
