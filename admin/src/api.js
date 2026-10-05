const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('oms_admin_token');
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      data.received != null
        ? ` (received: "${data.received}")`
        : data.allowed
          ? ' — please restart the backend and try again'
          : '';
    throw new Error((data.message || 'Request failed') + detail);
  }
  return data;
}

export { API_BASE };
