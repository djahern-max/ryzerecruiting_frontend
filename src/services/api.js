//src/services/api.js

export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };
    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 402) {
        const path = window.location.pathname;
        if (!path.startsWith('/upgrade') && !path.startsWith('/billing')) {
            window.location.href = '/upgrade';
            // Return a never-resolving promise so the caller doesn't continue
            return new Promise(() => { });
        }
    }

    return response;
}









