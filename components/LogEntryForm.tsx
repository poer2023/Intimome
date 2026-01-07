import React, { useState } from 'react';
import { ActivityType, LocationType, MoodType, PositionType, SessionLog } from '../types';
import { ApartmentSelector } from './ApartmentSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, Clock, Heart, User, Star, Smile, CheckCircle2, X, Music, Zap, Droplets, Hand, Sparkles, Flame, EyeOff } from 'lucide-react';
import { DateTimePickerModal } from './DateTimePicker';

interface LogEntryFormProps {
  onSave: (log: SessionLog) => void;
  onCancel: () => void;
  initialData?: SessionLog;
}

// --- SVG COMPONENTS (Updated Colors: Emerald #10b981 for Active, Slate #94a3b8 for Passive) ---

const MissionarySVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Bed/Base */}
    <path d="M10 85 L90 85" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />

    {/* Bottom Partner (Passive - Slate) */}
    <circle cx="25" cy="75" r="8" fill="#94a3b8" />
    <path d="M25 85 L75 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
    <path d="M55 85 L65 70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

    {/* Top Partner (Active - Emerald) */}
    <g className="animate-thrust-y origin-center">
      <circle cx="30" cy="60" r="8" fill="#f43f5e" />
      <path d="M30 68 L75 68" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M35 68 L35 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M70 68 L70 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const DoggySVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Bottom Partner (All Fours - Slate) */}
    <g transform="translate(5,0)">
      <circle cx="65" cy="65" r="8" fill="#94a3b8" />
      <path d="M65 73 L45 73" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <path d="M45 73 L45 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M65 73 L65 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Top Partner (Behind - Emerald) */}
    <g className="animate-thrust-x origin-bottom">
      <circle cx="25" cy="50" r="8" fill="#f43f5e" />
      <path d="M25 58 L38 73" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M20 73 L20 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 73 L45 73" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const CowgirlSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Bottom Partner (Lying - Slate) */}
    <circle cx="50" cy="85" r="7" fill="#94a3b8" />
    <path d="M20 85 L80 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

    {/* Top Partner (Sitting - Emerald) */}
    <g className="animate-bounce origin-bottom">
      <circle cx="50" cy="40" r="8" fill="#f43f5e" />
      <path d="M50 48 L50 68" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      {/* Legs Straddling */}
      <path d="M50 68 L30 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 68 L70 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 55 L65 55" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const RevCowgirlSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Bottom Partner (Lying - Slate) */}
    <circle cx="50" cy="85" r="7" fill="#94a3b8" />
    <path d="M20 85 L80 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

    {/* Top Partner (Sitting Backward - Emerald) */}
    <g className="animate-bounce origin-bottom">
      <circle cx="50" cy="40" r="8" fill="#f43f5e" />
      <path d="M50 48 L50 68" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      {/* Legs Straddling */}
      <path d="M50 68 L30 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 68 L70 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      {/* Arms back */}
      <path d="M50 55 L30 50" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

const SpooningSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-thrust-x">
      {/* Big Spoon - Emerald */}
      <path d="M30 80 Q 20 50 40 30" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="30" r="8" fill="#f43f5e" />

      {/* Little Spoon - Slate */}
      <path d="M50 80 Q 40 50 60 40" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="40" r="7" fill="#94a3b8" />
    </g>
  </svg>
);

const StandingSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Partner 1 - Slate */}
    <g transform="translate(-5,0)">
      <circle cx="40" cy="30" r="8" fill="#94a3b8" />
      <path d="M40 38 L40 70" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 70 L30 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 70 L50 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    </g>
    {/* Partner 2 (Active - Emerald) */}
    <g className="animate-bob">
      <circle cx="60" cy="35" r="8" fill="#f43f5e" />
      <path d="M60 43 L60 70" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 70 L70 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 70 L55 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 50 L45 50" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const OralSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Receiver - Slate */}
    <path d="M30 90 L30 50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
    <circle cx="30" cy="40" r="8" fill="#94a3b8" />

    {/* Giver - Emerald */}
    <g className="animate-bob">
      <circle cx="60" cy="70" r="8" fill="#f43f5e" />
      <path d="M60 78 L80 90" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 78 L40 78" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const SixtyNineSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-rock origin-center">
      {/* Top - Emerald */}
      <path d="M70 30 Q 60 20 50 30 T 30 50" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="70" cy="30" r="8" fill="#f43f5e" />

      {/* Bottom - Slate */}
      <path d="M30 70 Q 40 80 50 70 T 70 50" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="70" r="8" fill="#94a3b8" />
    </g>
  </svg>
);

// Lotus - face-to-face seated position
const LotusSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-rock origin-center">
      {/* Bottom Partner seated - Slate */}
      <circle cx="50" cy="55" r="8" fill="#94a3b8" />
      <path d="M50 63 L50 80" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 75 L35 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 75 L65 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

      {/* Top Partner facing - Emerald */}
      <circle cx="50" cy="35" r="8" fill="#f43f5e" />
      <path d="M50 43 L50 60" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 55 L35 75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 55 L65 75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 50 L60 50" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

// Prone Bone - lying flat, partner on top from behind
const ProneBoneSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Bottom Partner lying flat - Slate */}
    <circle cx="75" cy="75" r="7" fill="#94a3b8" />
    <path d="M20 80 L70 80" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

    {/* Top Partner on top - Emerald */}
    <g className="animate-thrust-y origin-center">
      <circle cx="70" cy="55" r="8" fill="#f43f5e" />
      <path d="M25 65 L65 65" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 65 L25 80" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M55 65 L55 80" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// Seated - one partner seated, other on lap
const SeatedSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Chair representation */}
    <path d="M30 90 L30 60 L70 60 L70 90" stroke="#cbd5e1" strokeWidth="3" fill="none" />

    {/* Seated Partner - Slate */}
    <circle cx="50" cy="45" r="7" fill="#94a3b8" />
    <path d="M50 52 L50 70" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
    <path d="M50 70 L40 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 70 L60 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

    {/* Partner on lap - Emerald */}
    <g className="animate-bounce origin-bottom">
      <circle cx="50" cy="25" r="8" fill="#f43f5e" />
      <path d="M50 33 L50 50" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 45 L35 60" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 45 L65 60" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// Sideways - side-by-side variant
const SidewaysSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-thrust-x">
      {/* Front Partner - Slate */}
      <circle cx="65" cy="50" r="7" fill="#94a3b8" />
      <path d="M65 57 Q 55 70 50 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Back Partner - Emerald */}
      <circle cx="35" cy="45" r="8" fill="#f43f5e" />
      <path d="M35 53 Q 45 65 55 80" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M40 60 L55 55" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

// Suspended - one partner lifted/held up
const SuspendedSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Standing Partner holding - Emerald */}
    <circle cx="40" cy="25" r="8" fill="#f43f5e" />
    <path d="M40 33 L40 65" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
    <path d="M40 65 L30 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    <path d="M40 65 L50 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />

    {/* Lifted Partner - Slate with bounce animation */}
    <g className="animate-bob">
      <circle cx="60" cy="35" r="7" fill="#94a3b8" />
      <path d="M60 42 L55 55" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      <path d="M55 50 L40 45" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <path d="M55 55 L45 70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M55 55 L65 70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// Legs Up - Missionary variant with raised legs
const LegsUpSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Bottom Partner with legs up - Slate */}
    <circle cx="25" cy="75" r="8" fill="#94a3b8" />
    <path d="M25 83 L70 83" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
    <path d="M55 83 L75 55" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    <path d="M65 83 L85 60" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

    {/* Top Partner - Emerald */}
    <g className="animate-thrust-y origin-center">
      <circle cx="35" cy="55" r="8" fill="#f43f5e" />
      <path d="M35 63 L70 63" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 63 L40 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M65 63 L65 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// Tabletop - Partner on edge of table/surface
const TabletopSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Table surface */}
    <path d="M15 70 L85 70" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
    <path d="M20 70 L20 90" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
    <path d="M80 70 L80 90" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

    {/* Partner on table - Slate */}
    <circle cx="55" cy="55" r="7" fill="#94a3b8" />
    <path d="M55 62 L55 70" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
    <path d="M55 68 L40 80" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    <path d="M55 68 L70 80" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

    {/* Standing Partner - Emerald */}
    <g className="animate-thrust-x">
      <circle cx="30" cy="45" r="8" fill="#f43f5e" />
      <path d="M30 53 L40 65" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 60 L25 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 60 L40 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// Scissors - Interlocking legs position
const ScissorsSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-rock origin-center">
      {/* Partner 1 - Slate */}
      <circle cx="25" cy="40" r="7" fill="#94a3b8" />
      <path d="M25 47 Q 40 60 60 75" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M35 55 L25 80" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

      {/* Partner 2 - Emerald */}
      <circle cx="75" cy="45" r="8" fill="#f43f5e" />
      <path d="M75 53 Q 60 65 40 80" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M65 60 L75 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const POSITION_CONFIG: Record<PositionType, { icon: React.FC; color: string }> = {
  // Ordered from most to least commonly used
  [PositionType.MISSIONARY]: { icon: MissionarySVG, color: 'bg-indigo-50/50' },
  [PositionType.DOGGY_STYLE]: { icon: DoggySVG, color: 'bg-slate-50' },
  [PositionType.COWGIRL]: { icon: CowgirlSVG, color: 'bg-indigo-50/50' },
  [PositionType.SPOONING]: { icon: SpooningSVG, color: 'bg-slate-50' },
  [PositionType.REVERSE_COWGIRL]: { icon: RevCowgirlSVG, color: 'bg-indigo-50/50' },
  [PositionType.ORAL]: { icon: OralSVG, color: 'bg-slate-50' },
  [PositionType.LEGS_UP]: { icon: LegsUpSVG, color: 'bg-indigo-50/50' },
  [PositionType.STANDING]: { icon: StandingSVG, color: 'bg-slate-50' },
  [PositionType.SIXTY_NINE]: { icon: SixtyNineSVG, color: 'bg-indigo-50/50' },
  [PositionType.LOTUS]: { icon: LotusSVG, color: 'bg-slate-50' },
  [PositionType.SEATED]: { icon: SeatedSVG, color: 'bg-indigo-50/50' },
  [PositionType.PRONE_BONE]: { icon: ProneBoneSVG, color: 'bg-slate-50' },
  [PositionType.SIDEWAYS]: { icon: SidewaysSVG, color: 'bg-indigo-50/50' },
  [PositionType.TABLETOP]: { icon: TabletopSVG, color: 'bg-slate-50' },
  [PositionType.SCISSORS]: { icon: ScissorsSVG, color: 'bg-indigo-50/50' },
  [PositionType.SUSPENDED]: { icon: SuspendedSVG, color: 'bg-slate-50' },
};

// Tags Configuration
const TAGS = [
  { id: 'Music', icon: Music },
  { id: 'Toys', icon: Zap },
  { id: 'Lube', icon: Droplets },
  { id: 'Massage', icon: Hand },
  { id: 'Candles', icon: Flame },
  { id: 'Blindfold', icon: EyeOff },
  { id: 'Spontaneous', icon: Sparkles },
];

export const LogEntryForm: React.FC<LogEntryFormProps> = ({ onSave, onCancel, initialData }) => {
  const { t } = useLanguage();
  const isEditMode = !!initialData;

  // Helper to format date for input
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().slice(0, 16);
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const [date, setDate] = useState(formatDateForInput(initialData?.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState(initialData?.durationMinutes ?? 20);
  const [type, setType] = useState(initialData?.type ?? ActivityType.PARTNER);
  const [location, setLocation] = useState(initialData?.location ?? LocationType.BEDROOM);
  const [positions, setPositions] = useState<PositionType[]>(initialData?.positions ?? [PositionType.MISSIONARY]);
  const [mood, setMood] = useState(initialData?.mood ?? MoodType.PASSIONATE);
  const [rating, setRating] = useState(initialData?.rating ?? 4);
  const [orgasmReached, setOrgasmReached] = useState(initialData?.orgasmReached ?? true);
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  // Remove QuickCapture tag when editing
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (initialData?.tags ?? []).filter(tag => tag !== 'QuickCapture')
  );

  const togglePosition = (pos: PositionType) => {
    if (positions.includes(pos)) {
      setPositions(positions.filter(p => p !== pos));
    } else {
      setPositions([...positions, pos]);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SessionLog = {
      id: initialData?.id ?? crypto.randomUUID(),
      date: new Date(date).toISOString(),
      durationMinutes: Number(duration),
      type,
      partnerName: undefined,
      location,
      positions: positions.length > 0 ? positions : [PositionType.MISSIONARY],
      mood,
      rating,
      orgasmReached,
      tags: selectedTags,
      notes,
    };
    onSave(newLog);
  };

  const MOOD_EMOJIS: Record<MoodType, string> = {
    [MoodType.PASSIONATE]: '🔥',
    [MoodType.TENDER]: '🥰',
    [MoodType.ROUGH]: '🤠',
    [MoodType.PLAYFUL]: '😜',
    [MoodType.TIRED]: '😴',
    [MoodType.QUICKIE]: '⚡',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up pb-32">

      {/* Main Info Card */}
      <div className="bg-white p-6 rounded-[32px] shadow-subtle border border-slate-100 space-y-8">

        {/* Type Toggle (Segmented Control) */}
        <div className="bg-slate-50 p-1.5 rounded-2xl flex relative">
          {Object.values(ActivityType).map((activityType) => {
            const isActive = type === activityType;
            return (
              <button
                key={activityType}
                type="button"
                onClick={() => setType(activityType)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative z-10 flex items-center justify-center gap-2 ${isActive
                  ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {activityType === ActivityType.SOLO ? <Zap size={16} /> : <Heart size={16} />}
                {t.activity[activityType]}
              </button>
            );
          })}
        </div>

        {/* Date & Duration Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Date Picker Trigger */}
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 text-left hover:bg-slate-100 transition-colors group"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar size={12} /> Date
            </div>
            <div className="text-sm font-bold text-slate-800">
              {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          </button>

          <DateTimePickerModal
            isOpen={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onConfirm={(d) => {
              const offset = d.getTimezoneOffset() * 60000;
              const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
              setDate(localISOTime);
              setShowDatePicker(false);
            }}
            initialDate={new Date(date)}
            title="Date & Time"
          />

          {/* Duration Slider Compact */}
          <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> Duration
              </div>
              <div className="text-sm font-bold text-brand-600">{duration}m</div>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        </div>

        {/* Mood Scroller */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block px-1">{t.theVibe}</label>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar snap-x">
            {Object.values(MoodType).map(m => {
              const isActive = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${isActive
                    ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm ring-1 ring-brand-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <span className="text-base">{MOOD_EMOJIS[m]}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{t.mood[m]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Location - Full width but styled simpler */}
        <div>
          <ApartmentSelector selectedLocation={location} onChange={setLocation} />
        </div>

      </div>

      {/* Positions Grid - Compact */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex justify-between">
          <span>{t.positions}</span>
          <span className="text-[10px] text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">{positions.length} selected</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {Object.values(PositionType).map((pos) => {
            const isSelected = positions.includes(pos);
            const config = POSITION_CONFIG[pos];
            const IconComponent = config.icon;

            return (
              <button
                key={pos}
                type="button"
                onClick={() => togglePosition(pos)}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-200 flex flex-col text-left aspect-square ${isSelected
                  ? 'ring-2 ring-brand-500 bg-white shadow-md'
                  : 'bg-white hover:bg-slate-50 border border-slate-100 shadow-sm'
                  }`}
              >
                <div className={`flex-1 w-full ${isSelected ? 'bg-brand-50/30' : 'bg-slate-50/30'} flex items-center justify-center p-2`}>
                  <div className={`w-full h-full text-slate-700 ${isSelected ? 'scale-110' : 'scale-90 opacity-60'}`}>
                    <IconComponent />
                  </div>
                </div>
                <div className="w-full py-1.5 border-t border-slate-50 text-center bg-white/50 backdrop-blur-sm absolute bottom-0">
                  <span className={`text-[9px] font-bold leading-none truncate block px-1 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`}>
                    {t.position[pos]}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-brand-500 rounded-full p-[2px]">
                    <CheckCircle2 size={8} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlights & Outcome */}
      <div className="bg-white p-6 rounded-[32px] shadow-subtle border border-slate-100 space-y-8">
        {/* Tags */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.highlights}</h3>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              const label = t.tags[tag.id as keyof typeof t.tags] || tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                    }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rating & Orgasm Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Rating */}
          <div className="bg-slate-50 rounded-[20px] p-4 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.satisfaction}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setRating(r)} className="focus:outline-none transition-transform active:scale-90">
                  <Star size={20} className={`${rating >= r ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Orgasm Toggle */}
          <button
            type="button"
            onClick={() => setOrgasmReached(!orgasmReached)}
            className={`rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 border transition-all ${orgasmReached
              ? 'bg-rose-50 border-rose-100 text-rose-600'
              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orgasmReached ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-300'}`}>
              {orgasmReached ? <Heart size={16} fill="currentColor" /> : <X size={16} />}
            </div>
            <span className="text-xs font-bold">{orgasmReached ? t.climaxReached : t.noClimax}</span>
          </button>
        </div>

        {/* Notes */}
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
            placeholder={t.notesPlaceholder}
          />
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2 pb-6 px-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[20px] font-bold text-sm transition-colors hover:bg-slate-200"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="flex-[2] py-4 bg-slate-900 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-slate-900/20 transition-all transform active:scale-[0.98] hover:bg-black"
        >
          {t.saveLog}
        </button>
      </div>
    </form>
  );
};
