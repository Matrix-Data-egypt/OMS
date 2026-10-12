const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      body:
        options.body instanceof FormData
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
    });
  } catch {
    throw new Error(
      'لا يمكن الاتصال بالسيرفر. شغّل الـ backend: cd backend && npm start'
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export { API_BASE };
