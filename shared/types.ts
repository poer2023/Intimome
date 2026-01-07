// Shared types for frontend and backend
// This file can be imported by both client and server code

export enum ActivityType {
    PARTNER = 'Partner',
    SOLO = 'Solo',
}

export enum LocationType {
    BEDROOM = 'Bedroom',
    LIVING_ROOM = 'Living Room',
    KITCHEN = 'Kitchen',
    BATHROOM = 'Bathroom', // Replaces SHOWER
    OFFICE = 'Office',     // Replaces STUDY
    OUTDOORS = 'Outdoors', // Replaces BALCONY
    HOTEL = 'Hotel',
    CAR = 'Car',
}

export enum PositionType {
    // 传统体位
    MISSIONARY = 'Missionary',
    DOGGY_STYLE = 'Doggy Style',
    COWGIRL = 'Cowgirl',
    REVERSE_COWGIRL = 'Reverse Cowgirl',
    SPOONING = 'Spooning',
    PRONE_BONE = 'Prone Bone',
    LEGS_UP = 'Legs Up',
    STANDING = 'Standing',
    LOTUS = 'Lotus',
    SEATED = 'Seated',
    SIDEWAYS = 'Sideways',
    TABLETOP = 'Tabletop',
    SCISSORS = 'Scissors',
    SUSPENDED = 'Suspended',
    // 口交
    BLOWJOB = 'Blowjob',
    CUNNILINGUS = 'Cunnilingus',
    SIXTY_NINE = '69',
    // 手动刺激
    HANDJOB = 'Handjob',
    FINGERING = 'Fingering',
    // 其他
    FACESITTING = 'Facesitting',
    ANAL = 'Anal',
}

export enum MoodType {
    PASSIONATE = 'Passionate',
    TENDER = 'Tender',
    KINKY = 'Kinky',     // Replaces ROUGH
    PLAYFUL = 'Playful',
    LAZY = 'Lazy',       // Replaces TIRED
    MAKEUP = 'Makeup',   // New
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
