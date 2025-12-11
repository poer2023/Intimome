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
          ${isOpen ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-rose-200'}
        `}
      >
        <span className="text-slate-800 truncate">
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : ''}`}
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
                  className={`
                  w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between
                  hover:bg-rose-50 transition-colors first:rounded-t-xl last:rounded-b-xl
                  ${value === opt.value ? 'bg-rose-50 text-rose-700' : 'text-slate-700'}
                `}
                >
                  {opt.label}
                  {value === opt.value && <Check size={16} className="text-rose-600" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};