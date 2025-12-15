// Shared types for frontend and backend
// This file can be imported by both client and server code

export enum ActivityType {
    PARTNER = 'Partner',
    SOLO = 'Solo',
}

export enum LocationType {
    BEDROOM = 'Bedroom',
    LIVING_ROOM = 'Living Room',
    SHOWER = 'Shower/Bath',
    KITCHEN = 'Kitchen',
    STUDY = 'Study',
    BALCONY = 'Balcony',
    HOTEL = 'Hotel',
    CAR = 'Car',
}

export enum PositionType {
    MISSIONARY = 'Missionary',
    DOGGY_STYLE = 'Doggy Style',
    COWGIRL = 'Cowgirl',
    SPOONING = 'Spooning',
    REVERSE_COWGIRL = 'Reverse Cowgirl',
    ORAL = 'Oral',
    LEGS_UP = 'Legs Up',
    STANDING = 'Standing',
    SIXTY_NINE = '69',
    LOTUS = 'Lotus',
    SEATED = 'Seated',
    PRONE_BONE = 'Prone Bone',
    SIDEWAYS = 'Sideways',
    TABLETOP = 'Tabletop',
    SCISSORS = 'Scissors',
    SUSPENDED = 'Suspended',
}

export enum MoodType {
    PASSIONATE = 'Passionate',
    TENDER = 'Tender',
    ROUGH = 'Rough',
    PLAYFUL = 'Playful',
    TIRED = 'Tired',
    QUICKIE = 'Quickie',
}

export interface SessionLog {
    id: string;
    date: string;
    durationMinutes: number;
    type: ActivityType;
    partnerName?: string;
    location: LocationType;
    positions: PositionType[];
    rating: number;
    mood: MoodType;
    tags?: string[];
    notes?: string;
    orgasmReached: boolean;
}

export interface AnalysisResponse {
    frequencyInsight: string;
    satisfactionInsight: string;
    diversityTip: string;
    personalizedTip: string;
    encouragement: string;
}

export type Language = 'en' | 'zh';

// API Request/Response types
export interface ApiResponse<T = unknown> {
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

export interface StatsData {
    totalSessions: number;
    avgDuration: number;
    avgRating: number;
    orgasmRate: number;
    thisWeekCount: number;
    lastWeekCount: number;
    favoritePosition: string;
    recentLogs: SessionLog[];
}

// User types
export interface User {
    username: string;
    displayName?: string;
    provider?: 'local' | 'google';
}
