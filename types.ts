export enum ActivityType {
  PARTNER = 'Partner',
  SOLO = 'Solo',
}

export enum LocationType {
  BEDROOM = 'Bedroom',
  LIVING_ROOM = 'Living Room',
  SHOWER = 'Shower/Bath',
  KITCHEN = 'Kitchen',
  OUTDOORS = 'Outdoors',
  OTHER = 'Other',
}

export enum PositionType {
  MISSIONARY = 'Missionary',
  DOGGY_STYLE = 'Doggy Style',
  COWGIRL = 'Cowgirl',
  REVERSE_COWGIRL = 'Reverse Cowgirl',
  SPOONING = 'Spooning',
  STANDING = 'Standing',
  ORAL = 'Oral',
  SIXTY_NINE = '69',
  OTHER = 'Other',
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
  date: string; // ISO string
  durationMinutes: number;
  type: ActivityType;
  partnerName?: string; // Optional, for privacy defaults to "Partner"
  location: LocationType;
  positions: PositionType[];
  rating: number; // 1-5
  mood: MoodType;
  tags?: string[]; // New field for props/context
  notes?: string;
  orgasmReached: boolean;
}

export interface AnalysisResponse {
  summary: string;
  wellnessTip: string;
  trendInsight: string;
}

export type Language = 'en' | 'zh';