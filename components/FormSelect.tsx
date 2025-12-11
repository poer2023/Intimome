import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-2 relative" ref={containerRef}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
        {icon} {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white border text-sm font-medium rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-sm
          ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-200'}
        `}
      >
        <span className="text-slate-800 truncate">
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-sm font-medium flex items-center justify-between cursor-pointer transition-colors
                    ${isSelected ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  {opt.label}
                  {isSelected && <Check size={14} className="text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};