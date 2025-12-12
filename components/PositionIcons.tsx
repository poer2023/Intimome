import React from 'react';
import { PositionType } from '../types';

// --- SVG COMPONENTS (Colors: Rose #f43f5e for Active, Slate #94a3b8 for Passive) ---

const MissionarySVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M10 85 L90 85" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <circle cx="25" cy="75" r="8" fill="#94a3b8" />
        <path d="M25 85 L75 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <path d="M55 85 L65 70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
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
        <g transform="translate(5,0)">
            <circle cx="65" cy="65" r="8" fill="#94a3b8" />
            <path d="M65 73 L45 73" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <path d="M45 73 L45 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M65 73 L65 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        </g>
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
        <circle cx="50" cy="85" r="7" fill="#94a3b8" />
        <path d="M20 85 L80 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <g className="animate-bounce origin-bottom">
            <circle cx="50" cy="40" r="8" fill="#f43f5e" />
            <path d="M50 48 L50 68" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 68 L30 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 68 L70 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 55 L65 55" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

const RevCowgirlSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="85" r="7" fill="#94a3b8" />
        <path d="M20 85 L80 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <g className="animate-bounce origin-bottom">
            <circle cx="50" cy="40" r="8" fill="#f43f5e" />
            <path d="M50 48 L50 68" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 68 L30 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 68 L70 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 55 L30 50" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        </g>
    </svg>
);

const SpooningSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <g className="animate-thrust-x">
            <path d="M30 80 Q 20 50 40 30" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="30" r="8" fill="#f43f5e" />
            <path d="M50 80 Q 40 50 60 40" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="60" cy="40" r="7" fill="#94a3b8" />
        </g>
    </svg>
);

const StandingSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <g transform="translate(-5,0)">
            <circle cx="40" cy="30" r="8" fill="#94a3b8" />
            <path d="M40 38 L40 70" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <path d="M40 70 L30 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 70 L50 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        </g>
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
        <path d="M30 90 L30 50" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <circle cx="30" cy="40" r="8" fill="#94a3b8" />
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
            <path d="M70 30 Q 60 20 50 30 T 30 50" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="70" cy="30" r="8" fill="#f43f5e" />
            <path d="M30 70 Q 40 80 50 70 T 70 50" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="30" cy="70" r="8" fill="#94a3b8" />
        </g>
    </svg>
);

const LotusSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <g className="animate-rock origin-center">
            <circle cx="50" cy="55" r="8" fill="#94a3b8" />
            <path d="M50 63 L50 80" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 75 L35 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 75 L65 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="35" r="8" fill="#f43f5e" />
            <path d="M50 43 L50 60" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 55 L35 75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 55 L65 75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 50 L60 50" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        </g>
    </svg>
);

const ProneBoneSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="75" cy="75" r="7" fill="#94a3b8" />
        <path d="M20 80 L70 80" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <g className="animate-thrust-y origin-center">
            <circle cx="70" cy="55" r="8" fill="#f43f5e" />
            <path d="M25 65 L65 65" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M30 65 L25 80" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M55 65 L55 80" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

const SeatedSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M30 90 L30 60 L70 60 L70 90" stroke="#cbd5e1" strokeWidth="3" fill="none" />
        <circle cx="50" cy="45" r="7" fill="#94a3b8" />
        <path d="M50 52 L50 70" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 70 L40 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 70 L60 90" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <g className="animate-bounce origin-bottom">
            <circle cx="50" cy="25" r="8" fill="#f43f5e" />
            <path d="M50 33 L50 50" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 45 L35 60" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 45 L65 60" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

const SidewaysSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <g className="animate-thrust-x">
            <circle cx="65" cy="50" r="7" fill="#94a3b8" />
            <path d="M65 57 Q 55 70 50 85" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="35" cy="45" r="8" fill="#f43f5e" />
            <path d="M35 53 Q 45 65 55 80" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M40 60 L55 55" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        </g>
    </svg>
);

const SuspendedSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="40" cy="25" r="8" fill="#f43f5e" />
        <path d="M40 33 L40 65" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
        <path d="M40 65 L30 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 65 L50 90" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        <g className="animate-bob">
            <circle cx="60" cy="35" r="7" fill="#94a3b8" />
            <path d="M60 42 L55 55" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <path d="M55 50 L40 45" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <path d="M55 55 L45 70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M55 55 L65 70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

const LegsUpSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="25" cy="75" r="8" fill="#94a3b8" />
        <path d="M25 83 L70 83" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        <path d="M55 83 L75 55" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <path d="M65 83 L85 60" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <g className="animate-thrust-y origin-center">
            <circle cx="35" cy="55" r="8" fill="#f43f5e" />
            <path d="M35 63 L70 63" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M40 63 L40 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M65 63 L65 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

const TabletopSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M15 70 L85 70" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 70 L20 90" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 70 L80 90" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="55" cy="55" r="7" fill="#94a3b8" />
        <path d="M55 62 L55 70" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
        <path d="M55 68 L40 80" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <path d="M55 68 L70 80" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <g className="animate-thrust-x">
            <circle cx="30" cy="45" r="8" fill="#f43f5e" />
            <path d="M30 53 L40 65" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <path d="M30 60 L25 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 60 L40 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

const ScissorsSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <g className="animate-rock origin-center">
            <circle cx="25" cy="40" r="7" fill="#94a3b8" />
            <path d="M25 47 Q 40 60 60 75" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M35 55 L25 80" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="75" cy="45" r="8" fill="#f43f5e" />
            <path d="M75 53 Q 60 65 40 80" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M65 60 L75 85" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
        </g>
    </svg>
);

export const POSITION_CONFIG: Record<PositionType, { icon: React.FC; color: string }> = {
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

export const PositionIcon: React.FC<{ position: PositionType; className?: string }> = ({ position, className = 'w-10 h-10' }) => {
    const config = POSITION_CONFIG[position];
    const IconComponent = config.icon;
    return (
        <div className={`${className} ${config.color} rounded-lg p-1`}>
            <IconComponent />
        </div>
    );
};
