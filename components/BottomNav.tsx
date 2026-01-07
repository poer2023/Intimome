import React, { useRef, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import confetti from 'canvas-confetti';

type NavKey = 'dashboard' | 'log' | 'history';

interface BottomNavProps {
  onQuickCapture?: () => Promise<void> | void;
}

// Long press duration in ms
const LONG_PRESS_DURATION = 600;

export function BottomNav({ onQuickCapture }: BottomNavProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isLongPressRef = useRef(false);

  // Track initial touch position for movement tolerance
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const MAX_MOVEMENT_DISTANCE = 10; // pixels

  const active: NavKey = location.pathname.startsWith('/history')
    ? 'history'
    : location.pathname.startsWith('/log')
      ? 'log'
      : 'dashboard';

  const itemBase =
    'w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ease-out';
  const itemActive = 'bg-slate-900 text-white shadow-lg shadow-slate-900/25';
  const itemInactive =
    'bg-white/60 text-slate-500 border border-white/50 hover:bg-white/80 hover:text-slate-700 active:scale-95';

  // Refs for iOS haptic feedback workaround - MUST use label refs!
  const lightHapticLabelRef = useRef<HTMLLabelElement>(null);
  const heavyHapticLabelRef = useRef<HTMLLabelElement>(null);

  // Trigger haptic feedback (iOS 18+ compatible)
  const triggerHaptic = useCallback((pattern: 'light' | 'heavy' = 'light') => {
    // Try standard Vibration API first (Android, some browsers)
    if ('vibrate' in navigator) {
      if (pattern === 'light') {
        navigator.vibrate(10);
      } else {
        navigator.vibrate([50, 30, 100]);
      }
    }

    // iOS 18+ workaround: click the LABEL (not input) to trigger haptic
    try {
      if (pattern === 'light' && lightHapticLabelRef.current) {
        lightHapticLabelRef.current.click();
      } else if (pattern === 'heavy' && heavyHapticLabelRef.current) {
        // Trigger multiple times for "heavy" effect
        heavyHapticLabelRef.current.click();
        setTimeout(() => heavyHapticLabelRef.current?.click(), 80);
        setTimeout(() => heavyHapticLabelRef.current?.click(), 180);
      }
    } catch (e) {
      // Silently fail if haptic not supported
    }
  }, []);

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.85, x: 0.5 },
      colors,
      startVelocity: 45,
      gravity: 1.2,
      scalar: 1.1,
    });

    // Second burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.3, y: 0.85 },
        colors,
        startVelocity: 35,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.7, y: 0.85 },
        colors,
        startVelocity: 35,
      });
    }, 150);
  }, []);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Handle long press success
  const handleLongPressSuccess = useCallback(async () => {
    clearTimers();
    setIsCharging(false);
    setChargeProgress(0);
    isLongPressRef.current = true;

    // Heavy haptic feedback
    triggerHaptic('heavy');

    // Fire confetti
    fireConfetti();

    // Call the quick capture callback
    if (onQuickCapture) {
      await onQuickCapture();
    }
  }, [clearTimers, triggerHaptic, fireConfetti, onQuickCapture]);

  // Start press
  const handlePressStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isLongPressRef.current = false;
    startTimeRef.current = Date.now();
    setIsCharging(true);
    setChargeProgress(0);

    // Record initial touch position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPositionRef.current = { x: clientX, y: clientY };

    // Light haptic on start
    triggerHaptic('light');

    // Progress animation
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setChargeProgress(progress);
    }, 16);

    // Long press timer
    pressTimerRef.current = setTimeout(() => {
      handleLongPressSuccess();
    }, LONG_PRESS_DURATION);
  }, [triggerHaptic, handleLongPressSuccess]);


  // End press
  const handlePressEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();

    const wasLongPress = isLongPressRef.current;
    const elapsed = Date.now() - startTimeRef.current;

    clearTimers();
    setIsCharging(false);
    setChargeProgress(0);

    // If long press was triggered, do NOT navigate
    // This prevents accidental tap after long press completion
    if (wasLongPress) {
      return;
    }

    // Only navigate if it was a genuine short press
    // Use a stricter threshold (e.g., 80% of long press duration) to avoid edge cases
    const SHORT_PRESS_MAX = LONG_PRESS_DURATION * 0.8;
    if (elapsed < SHORT_PRESS_MAX) {
      navigate('/log');
    }
  }, [clearTimers, navigate]);

  // Handle movement during press
  const handlePressMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!startPositionRef.current || !isCharging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startPositionRef.current.x;
    const deltaY = clientY - startPositionRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel if moved beyond threshold
    if (distance > MAX_MOVEMENT_DISTANCE) {
      clearTimers();
      setIsCharging(false);
      setChargeProgress(0);
      startPositionRef.current = null;
    }
  }, [isCharging, clearTimers, MAX_MOVEMENT_DISTANCE]);

  // Cancel press (e.g., when finger moves away)
  const handlePressCancel = useCallback(() => {
    clearTimers();
    setIsCharging(false);
    setChargeProgress(0);
    startPositionRef.current = null;
  }, [clearTimers]);

  return (
    <nav
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-label="底部导航"
    >
      {/* Liquid Glass Container */}
      <div
        className="pointer-events-auto flex items-center gap-3 px-3 py-2 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.04),
            0 2px 8px rgba(0,0,0,0.02),
            inset 0 1px 1px rgba(255,255,255,0.3)
          `,
        }}
      >
        <Link
          to="/"
          aria-label={t.dashboard}
          aria-current={active === 'dashboard' ? 'page' : undefined}
          className={`${itemBase} ${active === 'dashboard' ? itemActive : itemInactive}`}
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">{t.dashboard}</span>
        </Link>

        {/* Center button with long press support */}
        <button
          type="button"
          aria-label={t.newLog}
          onTouchStart={handlePressStart}
          onTouchMove={handlePressMove}
          onTouchEnd={handlePressEnd}
          onTouchCancel={handlePressCancel}
          onMouseDown={handlePressStart}
          onMouseMove={handlePressMove}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressCancel}
          className={`
            relative w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white 
            transition-all duration-150 ease-out select-none touch-none
            ${isCharging ? 'scale-110 animate-charging-shake' : 'active:scale-95'}
          `}
          style={{
            boxShadow: isCharging
              ? `0 0 ${20 + chargeProgress * 0.3}px rgba(244, 63, 94, ${0.3 + chargeProgress * 0.005}), 0 4px 20px rgba(15,23,42,0.3)`
              : '0 4px 20px rgba(15,23,42,0.3), 0 2px 8px rgba(15,23,42,0.2)',
          }}
        >
          {/* Progress ring */}
          {isCharging && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 56 56"
            >
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="rgba(244, 63, 94, 0.3)"
                strokeWidth="3"
              />
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - chargeProgress / 100)}`}
                className="transition-all duration-75 ease-linear"
              />
            </svg>
          )}
          <Plus className={`w-6 h-6 transition-transform ${isCharging ? 'scale-110' : ''}`} aria-hidden="true" />
          <span className="sr-only">{t.newLog}</span>
        </button>

        <Link
          to="/history"
          aria-label={t.history}
          aria-current={active === 'history' ? 'page' : undefined}
          className={`${itemBase} ${active === 'history' ? itemActive : itemInactive}`}
        >
          <History className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">{t.history}</span>
        </Link>
      </div>

      {/* Hidden switch inputs for iOS 18+ haptic feedback */}
      {/* IMPORTANT: Must click the LABEL, not the input, to trigger haptic */}
      <label
        ref={lightHapticLabelRef}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <input
          type="checkbox"
          // @ts-ignore - switch is a non-standard attribute for iOS
          switch="true"
          tabIndex={-1}
          aria-hidden="true"
        />
      </label>
      <label
        ref={heavyHapticLabelRef}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <input
          type="checkbox"
          // @ts-ignore - switch is a non-standard attribute for iOS
          switch="true"
          tabIndex={-1}
          aria-hidden="true"
        />
      </label>


      {/* CSS for charging shake animation */}
      <style>{`
        @keyframes charging-shake {
          0%, 100% { transform: scale(1.1) translateX(0); }
          10% { transform: scale(1.1) translateX(-1px) rotate(-1deg); }
          20% { transform: scale(1.12) translateX(1px) rotate(1deg); }
          30% { transform: scale(1.1) translateX(-1.5px) rotate(-0.5deg); }
          40% { transform: scale(1.13) translateX(1.5px) rotate(0.5deg); }
          50% { transform: scale(1.1) translateX(-1px) rotate(-1deg); }
          60% { transform: scale(1.14) translateX(1px) rotate(1deg); }
          70% { transform: scale(1.1) translateX(-1.5px) rotate(-0.5deg); }
          80% { transform: scale(1.15) translateX(1.5px) rotate(0.5deg); }
          90% { transform: scale(1.1) translateX(-1px) rotate(-1deg); }
        }
        .animate-charging-shake {
          animation: charging-shake 0.15s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
}
