import { SessionLog } from '../types';

// Use relative path for Cloudflare Pages Functions (production)
// or VITE_API_BASE for local development with Express
const API_BASE = import.meta.env.VITE_API_BASE || '';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface PaginatedLogsResponse {
    logs: SessionLog[];
    pagination: PaginationInfo;
}

export interface LogFilters {
    from?: string;
    to?: string;
    mood?: string;
    location?: string;
    type?: string;
    search?: string;
}

export const fetchLogs = async (
    page: number = 1,
    limit: number = 15,
    filters?: LogFilters
): Promise<PaginatedLogsResponse> => {
    try {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit)
        });

        // Add filter params if provided
        if (filters) {
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);
            if (filters.mood) params.append('mood', filters.mood);
            if (filters.location) params.append('location', filters.location);
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);
        }

        const res = await fetch(`${API_BASE}/api/logs?${params.toString()}`, { credentials: 'include' });
        if (!res.ok) {
            console.error('Failed to fetch logs:', res.status);
            return { logs: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false } };
        }
        const data = await res.json() as ApiResponse<SessionLog[]> & { pagination?: PaginationInfo };
        if (data.success && data.data) {
            return {
                logs: data.data,
                pagination: data.pagination || { page: 1, limit, total: data.data.length, totalPages: 1, hasMore: false }
            };
        }
        return { logs: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false } };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return { logs: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false } };
    }
};

export const saveLog = async (log: SessionLog): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ log }),
            credentials: 'include',
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

export const deleteLog = async (logId: string): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/api/logs`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logId }),
            credentials: 'include',
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

// Countdown timer functions
export const fetchCountdownTarget = async (): Promise<string | null> => {
    try {
        const res = await fetch(`${API_BASE}/api/countdown`, { credentials: 'include' });
        if (!res.ok) {
            console.error('Failed to fetch countdown:', res.status);
            return null;
        }
        const data = await res.json() as ApiResponse<{ countdownTarget: string | null }>;
        if (data.success && data.data) {
            return data.data.countdownTarget;
        }
        return null;
    } catch (error) {
        console.error('Error fetching countdown:', error);
        return null;
    }
};

export const saveCountdownTarget = async (countdownTarget: string | null): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE}/api/countdown`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ countdownTarget }),
            credentials: 'include',
        });
        if (!res.ok) {
            console.error('Failed to save countdown:', res.status);
            return false;
        }
        const data = await res.json() as ApiResponse;
        return data.success === true;
    } catch (error) {
        console.error('Error saving countdown:', error);
        return false;
    }
};
