//src/services/api.js

export async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);

    if (response.status === 402) {
        window.location.href = '/upgrade';
        // Return a never-resolving promise so the caller doesn't continue
        return new Promise(() => { });
    }

    return response;
}









