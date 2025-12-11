import { SessionLog } from '../types';

// Use relative path for Cloudflare Pages Functions (production)
// or VITE_API_BASE for local development with Express
const API_BASE = import.meta.env.VITE_API_BASE || '';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export const fetchLogs = async (username: string): Promise<SessionLog[]> => {
    try {
        const res = await fetch(`${API_BASE}/api/logs?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
            console.error('Failed to fetch logs:', res.status);
            return [];
        }
        const data = await res.json() as ApiResponse<SessionLog[]>;
        if (data.success && data.data) {
            return data.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching logs:', error);
        return [];
    }
};

export const saveLog = async (username: string, log: SessionLog): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, log }),
        });
        if (!res.ok) {
            console.error('Failed to save log:', res.status);
            return false;
        }
        const data = await res.json() as ApiResponse;
        return data.success === true;
    } catch (error) {
        console.error('Error saving log:', error);
        return false;
    }
};

export const deleteLog = async (username: string, logId: string): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/api/logs`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, logId }),
        });
        if (!res.ok) {
            console.error('Failed to delete log:', res.status);
            return false;
        }
        const data = await res.json() as ApiResponse;
        return data.success === true;
    } catch (error) {
        console.error('Error deleting log:', error);
        return false;
    }
};
