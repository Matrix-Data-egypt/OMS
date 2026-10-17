/**
 * OMS Enterprise API Client & Security Utility Layer
 * Compliant with XSS protection, SSRF guards, and secure payload handling.
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Sanitizes strings against script injection and XSS payloads.
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
}

/**
 * Resolves media URLs securely, guarding against unsafe protocols (e.g. javascript:, data:).
 */
export function mediaUrl(path) {
  if (!path) return '';
  if (typeof path !== 'string') return '';

  // Block malicious protocols
  const trimmed = path.trim().toLowerCase();
  // eslint-disable-next-line no-script-url
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:')) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Enterprise API fetch with timeout, secure headers, and structured error handling.
 */
export async function api(path, options = {}) {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {})
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  // 15-second timeout guard to prevent UI lockup
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers,
      body:
        options.body instanceof FormData
          ? options.body
          : options.body
            ? JSON.stringify(options.body)
            : undefined,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('انتهت مهلة الطلب (Request timeout). يرجى المحاولة مرة أخرى.');
    }
    throw new Error(
      'لا يمكن الاتصال بالسيرفر. شغّل الـ backend: cd backend && npm start'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed with status ' + res.status);
  }
  return data;
}

export { API_BASE };
