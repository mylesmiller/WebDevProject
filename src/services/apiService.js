let redirecting = false;

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && !redirecting && url && !url.includes('/api/auth/')) {
      const onAuthPage =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/login' || window.location.pathname === '/passenger-login');
      if (!onAuthPage) {
        redirecting = true;
        try { fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
        if (typeof window !== 'undefined') window.location.replace('/login');
      }
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

const apiService = {
  get: (url) => request(url),
  post: (url, body) => request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  put: (url, body) => request(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  delete: (url) => request(url, { method: 'DELETE' })
};

export default apiService;
