const API_URL = 'http://localhost:3000';

export const api = {
    baseUrl: API_URL,

    async get<T>(endpoint: string): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers,
            credentials: 'include'
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async post<T>(endpoint: string, data: unknown): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async put<T>(endpoint: string, data: unknown): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async patch<T>(endpoint: string, data: unknown): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async delete<T>(endpoint: string): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
            credentials: 'include'
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};
