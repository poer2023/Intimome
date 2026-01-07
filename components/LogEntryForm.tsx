import React, { useState } from 'react';
import { ActivityType, LocationType, MoodType, PositionType, SessionLog } from '../types';
import { ApartmentSelector } from './ApartmentSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, Clock, Heart, User, Star, Smile, CheckCircle2, X, Music, Zap, Droplets, Hand, Sparkles, Flame, EyeOff, Shield, Shirt, Trees, Wine, Monitor } from 'lucide-react';
import { DateTimePickerModal } from './DateTimePicker';
import { POSITION_CONFIG } from './PositionIcons';

interface LogEntryFormProps {
  onSave: (log: SessionLog) => void;
  onCancel: () => void;
  initialData?: SessionLog;
}




// Tags Configuration
const TAGS = [
  { id: 'Music', icon: Music },
  { id: 'Toys', icon: Zap },
  { id: 'Lube', icon: Droplets },
  { id: 'Massage', icon: Hand },
  { id: 'Safe Sex', icon: Shield },
  { id: 'Costume', icon: Shirt },
  { id: 'Mirror', icon: Monitor }, // Using Monitor as proxy for frame/mirror
  { id: 'Outdoor', icon: Trees },
  { id: 'Period', icon: Calendar }, // Using Calendar for period tracking
  { id: 'Drunk', icon: Wine },
];

const POSITION_CATEGORIES = {
  classics: [PositionType.MISSIONARY, PositionType.DOGGY_STYLE, PositionType.COWGIRL, PositionType.SPOONING],
  oralManual: [PositionType.BLOWJOB, PositionType.CUNNILINGUS, PositionType.SIXTY_NINE, PositionType.HANDJOB, PositionType.FINGERING],
  adventure: [PositionType.REVERSE_COWGIRL, PositionType.PRONE_BONE, PositionType.LEGS_UP, PositionType.STANDING, PositionType.SUSPENDED, PositionType.ANAL, PositionType.FACESITTING],
  intimate: [PositionType.LOTUS, PositionType.SEATED, PositionType.SIDEWAYS, PositionType.TABLETOP, PositionType.SCISSORS]
};

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

  // Animation State: 'idle' | 'building' | 'recovering' | 'completed'
  const [climaxPhase, setClimaxPhase] = useState<'idle' | 'building' | 'recovering' | 'completed'>('idle');
  const [showBurst, setShowBurst] = useState(false);
  const [showText, setShowText] = useState(!initialData?.orgasmReached); // Hide initially if starting with orgasm

  // Auto-trigger animation when entering viewport with orgasmReached=true
  React.useEffect(() => {
    if (orgasmReached && climaxPhase === 'idle') {
      // Start building animation on mount
      setClimaxPhase('building');
      setShowText(false);

      setTimeout(() => {
        setShowBurst(true);
        setClimaxPhase('recovering');

        // Hide burst, start recovery
        setTimeout(() => {
          setShowBurst(false);
        }, 600);

        // Full recovery after 2s, then show text
        setTimeout(() => {
          setClimaxPhase('completed');
          setShowText(true);
        }, 2000);
      }, 2500);
    }
  }, []); // Run once on mount

  const toggleOrgasm = () => {
    if (orgasmReached) {
      // Turning off
      setOrgasmReached(false);
      setClimaxPhase('idle');
      setShowBurst(false);
      setShowText(true);
    } else {
      // Turning on - Start sequence
      setOrgasmReached(true);
      setClimaxPhase('building');
      setShowText(false);

      // Sequence: Building (2.5s) -> Burst (0.6s) -> Recovering (2s) -> Completed
      setTimeout(() => {
        setShowBurst(true);
        setClimaxPhase('recovering');

        // Hide burst after animation
        setTimeout(() => {
          setShowBurst(false);
        }, 600);

        // Full recovery after 2s, then show text
        setTimeout(() => {
          setClimaxPhase('completed');
          setShowText(true);
        }, 2000);
      }, 2500);
    }
  };

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredPositions = activeCategory === 'all'
    ? Object.values(PositionType)
    : POSITION_CATEGORIES[activeCategory as keyof typeof POSITION_CATEGORIES];

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
    [MoodType.KINKY]: '😈',
    [MoodType.PLAYFUL]: '😜',
    [MoodType.LAZY]: '🛌',
    [MoodType.MAKEUP]: '❤️‍🩹',
    [MoodType.QUICKIE]: '⚡',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up pb-32">

      {/* Main Info Card */}
      <div className="bg-white p-6 rounded-[var(--radius-modal)] shadow-subtle border border-slate-100 space-y-8">

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
            className="bg-slate-50 border border-slate-100 rounded-[var(--radius-button)] p-4 text-left hover:bg-slate-100 transition-colors group"
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
          <div className="bg-slate-50 border border-slate-100 rounded-[var(--radius-button)] p-4 flex flex-col justify-between">
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
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex justify-between items-center">
          <span>{t.positions}</span>
          <span className="text-[10px] text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">{positions.length} selected</span>
        </h3>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-2 -mx-2 no-scrollbar snap-x">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`snap-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'all'
              ? 'bg-brand-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {t.posCats.all}
          </button>
          {Object.keys(POSITION_CATEGORIES).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`snap-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {t.posCats[cat as keyof typeof t.posCats]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredPositions.map((pos) => {
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
      <div className="bg-white p-6 rounded-[var(--radius-modal)] shadow-subtle border border-slate-100 space-y-8">
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
          <div className="bg-slate-50 rounded-[var(--radius-button)] p-4 flex flex-col items-center justify-center gap-2">
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
            onClick={toggleOrgasm}
            className={`rounded-[var(--radius-button)] p-4 flex flex-col items-center justify-center gap-2 border relative overflow-hidden ${climaxPhase === 'recovering'
              ? 'bg-white border-rose-200 text-rose-600 transition-colors duration-[2000ms]'
              : orgasmReached
                ? 'bg-rose-50 border-rose-100 text-rose-600 transition-colors duration-[2000ms]'
                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 transition-all'
              }`}
          >
            {/* Burst Rings - appear at end of building phase */}
            {showBurst && (
              <>
                {/* Outer expanding rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full border-2 border-rose-400 animate-burst-ring" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full border-2 border-rose-300 animate-burst-ring-delay" />
                </div>

                {/* Bright Core Flash - intense white center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-6 h-6 rounded-full bg-white animate-flash-core" />
                </div>

                {/* Outer Glow Flash - large expanding glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full bg-white/80 animate-flash-burst" />
                </div>
              </>
            )}

            {/* Heart Container */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${climaxPhase === 'recovering' ? 'bg-white duration-[2000ms]' : 'duration-300'
              } ${orgasmReached && climaxPhase !== 'recovering' ? 'bg-rose-100 text-rose-500' : ''} ${!orgasmReached ? 'bg-slate-100 text-slate-300' : 'text-rose-500'
              } ${climaxPhase === 'building' ? 'scale-110' : ''}`}>
              {orgasmReached ? (
                climaxPhase === 'building' ? (
                  <Heart
                    size={16}
                    fill="currentColor"
                    className="animate-climax-sequence"
                  />
                ) : (
                  <Heart
                    size={16}
                    fill="currentColor"
                    className={showBurst ? 'animate-heart-appear' : 'animate-heartbeat'}
                  />
                )
              ) : (
                <X size={16} />
              )}
            </div>

            {/* Label - only show when showText is true */}
            {showText && (
              <span className="text-xs font-bold z-10 animate-text-fade-in">
                {orgasmReached ? t.climaxReached : t.noClimax}
              </span>
            )}
          </button>
        </div>

        {/* Notes */}
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-100 rounded-[var(--radius-input)] p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
            placeholder={t.notesPlaceholder}
          />
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2 pb-6 px-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[var(--radius-button)] font-bold text-sm transition-colors hover:bg-slate-200"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="flex-[2] py-4 bg-slate-900 text-white rounded-[var(--radius-button)] font-bold text-sm shadow-elevation shadow-slate-900/20 transition-all transform active:scale-[0.98] hover:bg-black"
        >
          {t.saveLog}
        </button>
      </div>
    </form>
  );
};
