import React from 'react';
import { LocationType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, Bath, Utensils, BedDouble, Trees, HelpCircle, Armchair } from 'lucide-react';

interface ApartmentSelectorProps {
  selectedLocation: LocationType;
  onChange: (location: LocationType) => void;
}

export const ApartmentSelector: React.FC<ApartmentSelectorProps> = ({ selectedLocation, onChange }) => {
  const { t } = useLanguage();

  const LOCATION_ICONS: Record<LocationType, React.ElementType> = {
    [LocationType.BEDROOM]: BedDouble,
    [LocationType.LIVING_ROOM]: Armchair,
    [LocationType.SHOWER]: Bath,
    [LocationType.KITCHEN]: Utensils,
    [LocationType.OUTDOORS]: Trees,
    [LocationType.OTHER]: HelpCircle,
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
           <Home size={14} className="text-emerald-600" /> {t.where}
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.values(LocationType).map((loc) => {
          const Icon = LOCATION_ICONS[loc] || Home;
          const isSelected = selectedLocation === loc;
          
          return (
            <button
              key={loc}
              type="button"
              onClick={() => onChange(loc)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 group ${
                isSelected 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500 shadow-sm transform scale-[1.02]' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-slate-50 hover:shadow-sm'
              }`}
            >
              <div className={`p-3 rounded-full mb-3 transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-emerald-500'}`}>
                <Icon size={24} />
              </div>
              <span className={`text-xs font-bold text-center ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>
                {t.location[loc]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};