import React from 'react';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options, icon }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block w-full p-3.5 shadow-sm transition-all hover:border-emerald-200"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};