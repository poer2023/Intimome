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
  // Ordered from most to least commonly used
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
  frequencyInsight: string;
  satisfactionInsight: string;
  diversityTip: string;
  personalizedTip: string;
  encouragement: string;
}

export type Language = 'en' | 'zh';