import React, { useState } from 'react';
import { ActivityType, LocationType, MoodType, PositionType, SessionLog } from '../types';
import { FormSelect } from './FormSelect';
import { ApartmentSelector } from './ApartmentSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, Clock, Heart, MapPin, User, Star, Smile, CheckCircle2, X, PlayCircle, Music, Zap, Droplets, Hand, Sparkles, Flame, EyeOff } from 'lucide-react';

interface LogEntryFormProps {
  onSave: (log: SessionLog) => void;
  onCancel: () => void;
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
      <circle cx="30" cy="60" r="8" fill="#10b981" />
      <path d="M30 68 L75 68" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      <path d="M35 68 L35 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M70 68 L70 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
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
      <circle cx="25" cy="50" r="8" fill="#10b981" />
      <path d="M25 58 L38 73" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      <path d="M20 73 L20 90" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 73 L45 73" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
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
      <circle cx="50" cy="40" r="8" fill="#10b981" />
      <path d="M50 48 L50 68" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      {/* Legs Straddling */}
      <path d="M50 68 L30 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 68 L70 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 55 L65 55" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
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
      <circle cx="50" cy="40" r="8" fill="#10b981" />
      <path d="M50 48 L50 68" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      {/* Legs Straddling */}
      <path d="M50 68 L30 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 68 L70 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      {/* Arms back */}
      <path d="M50 55 L30 50" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

const SpooningSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-thrust-x">
      {/* Big Spoon - Emerald */}
      <path d="M30 80 Q 20 50 40 30" stroke="#10b981" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="30" r="8" fill="#10b981" />

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
      <circle cx="60" cy="35" r="8" fill="#10b981" />
      <path d="M60 43 L60 70" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 70 L70 90" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 70 L55 85" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 50 L45 50" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
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
      <circle cx="60" cy="70" r="8" fill="#10b981" />
      <path d="M60 78 L80 90" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 78 L40 78" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

const SixtyNineSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <g className="animate-rock origin-center">
      {/* Top - Emerald */}
      <path d="M70 30 Q 60 20 50 30 T 30 50" stroke="#10b981" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="70" cy="30" r="8" fill="#10b981" />

      {/* Bottom - Slate */}
      <path d="M30 70 Q 40 80 50 70 T 70 50" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="70" r="8" fill="#94a3b8" />
    </g>
  </svg>
);

const OtherSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="40" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-spin-slow" />
    <text x="50" y="55" textAnchor="middle" fill="#94a3b8" fontSize="30" fontWeight="bold">?</text>
  </svg>
);

const POSITION_CONFIG: Record<PositionType, { icon: React.FC; color: string }> = {
  [PositionType.MISSIONARY]: { icon: MissionarySVG, color: 'bg-emerald-50/50' },
  [PositionType.DOGGY_STYLE]: { icon: DoggySVG, color: 'bg-slate-50' },
  [PositionType.COWGIRL]: { icon: CowgirlSVG, color: 'bg-emerald-50/50' },
  [PositionType.REVERSE_COWGIRL]: { icon: RevCowgirlSVG, color: 'bg-slate-50' },
  [PositionType.SPOONING]: { icon: SpooningSVG, color: 'bg-slate-50' },
  [PositionType.STANDING]: { icon: StandingSVG, color: 'bg-slate-50' },
  [PositionType.ORAL]: { icon: OralSVG, color: 'bg-emerald-50/50' },
  [PositionType.SIXTY_NINE]: { icon: SixtyNineSVG, color: 'bg-slate-50' },
  [PositionType.OTHER]: { icon: OtherSVG, color: 'bg-slate-50' },
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

export const LogEntryForm: React.FC<LogEntryFormProps> = ({ onSave, onCancel }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState(20);
  const [type, setType] = useState(ActivityType.PARTNER);
  const [location, setLocation] = useState(LocationType.BEDROOM);
  const [positions, setPositions] = useState<PositionType[]>([PositionType.MISSIONARY]);
  const [mood, setMood] = useState(MoodType.PASSIONATE);
  const [rating, setRating] = useState(4);
  const [orgasmReached, setOrgasmReached] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      durationMinutes: Number(duration),
      type,
      partnerName: undefined, // Partner name field removed from UI
      location,
      positions: positions.length > 0 ? positions : [PositionType.OTHER],
      mood,
      rating,
      orgasmReached,
      tags: selectedTags, // Store original IDs
      notes,
    };
    onSave(newLog);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up pb-20 md:pb-0">

      {/* Top Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t.details}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600" /> {t.dateTime}
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Clock size={14} className="text-emerald-600" /> {t.durationLabel}: <span className="text-emerald-700 font-bold">{duration} {t.min}</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-400 font-medium">1m</span>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400 font-medium">2h</span>
            </div>
          </div>

          {/* Type */}
          <FormSelect
            label={t.whoWith}
            value={type}
            onChange={(v) => setType(v as ActivityType)}
            options={Object.values(ActivityType).map(v => ({ value: v, label: t.activity[v] }))}
            icon={<User size={14} className="text-emerald-600" />}
          />



          {/* Mood */}
          <FormSelect
            label={t.theVibe}
            value={mood}
            onChange={(v) => setMood(v as MoodType)}
            options={Object.values(MoodType).map(v => ({ value: v, label: t.mood[v] }))}
            icon={<Smile size={14} className="text-emerald-600" />}
          />
        </div>

        {/* 3D Location Selector (Full Width) */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <ApartmentSelector selectedLocation={location} onChange={setLocation} />
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-400">Selected: <span className="font-bold text-emerald-600">{t.location[location]}</span></span>
          </div>
        </div>

      </div>

      {/* Positions Section - Enhanced Visuals */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.positions}</h3>
          <span className="text-[10px] text-slate-400 font-medium">{t.selectMultiple}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.values(PositionType).map((pos) => {
            const isSelected = positions.includes(pos);
            const config = POSITION_CONFIG[pos];
            const IconComponent = config.icon;

            return (
              <button
                key={pos}
                type="button"
                onClick={() => togglePosition(pos)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-200 flex flex-col text-left h-40 ${isSelected
                    ? 'ring-2 ring-emerald-500 bg-white shadow-md'
                    : 'border border-slate-100 hover:border-slate-300 bg-white hover:shadow-sm'
                  }`}
              >
                {/* Visual Area */}
                <div className={`h-[75%] w-full ${config.color} flex items-center justify-center relative overflow-hidden p-2`}>
                  <div className={`w-20 h-20 transition-transform duration-500 ${isSelected ? 'scale-110' : 'scale-95 opacity-70 group-hover:scale-100 group-hover:opacity-90'}`}>
                    <IconComponent />
                  </div>

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-emerald-500 rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Area */}
                <div className="h-[25%] w-full px-3 flex flex-col justify-center border-t border-slate-50">
                  <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {t.position[pos]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Context / Props Tags */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.highlights}</h3>
        <div className="flex flex-wrap gap-3">
          {TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            const Icon = tag.icon;
            const label = t.tags[tag.id as keyof typeof t.tags] || tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${isSelected
                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                <Icon size={16} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rating & Orgasm */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.outcome}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Star size={14} className="text-emerald-600" /> {t.satisfaction}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`flex-1 h-10 rounded-lg flex items-center justify-center transition-all ${rating >= r
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-slate-100 text-slate-300'
                    }`}
                >
                  <Star size={16} fill={rating >= r ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setOrgasmReached(!orgasmReached)}
              className={`flex items-center gap-3 px-6 h-10 rounded-lg border transition-all w-full justify-center font-semibold text-sm ${orgasmReached
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                }`}
            >
              <CheckCircle2 size={16} className={orgasmReached ? "text-teal-600" : "text-slate-300"} />
              {orgasmReached ? t.climaxReached : t.noClimax}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.notes}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            placeholder={t.notesPlaceholder}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all transform active:scale-95"
        >
          {t.saveLog}
        </button>
      </div>
    </form>
  );
};
