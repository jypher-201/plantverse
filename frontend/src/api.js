const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

// The access token lives only in this variable (memory), not in localStorage
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

// fetch() throws when the server cannot be reached at all; turn that into a readable error
async function request(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    const err = new Error('Cannot reach the server. Check that the backend is running and your network works.');
    err.status = 0;
    throw err;
  }
}

function send(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return request(API_URL + path, {
    method,
    headers,
    credentials: 'include', // lets the refresh-token cookie travel
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Uses the refresh cookie to get a new 15-minute access token
export async function refreshAccessToken() {
  const res = await request(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    accessToken = null;
    return false;
  }
  const data = await res.json();
  accessToken = data.accessToken;
  return true;
}

export async function api(path, options) {
  let res = await send(path, options);

  // An expired access token gives 403: refresh once, then retry the request
  if (res.status === 403 && accessToken) {
    if (await refreshAccessToken()) {
      res = await send(path, options);
    }
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || data?.errors?.join(', ') || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}