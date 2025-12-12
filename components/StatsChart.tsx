import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SessionLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PieChart as PieIcon, BarChart as BarChartIcon } from 'lucide-react';

interface StatsChartProps {
  data: SessionLog[];
}

// Diverse Palette: Indigo, Emerald, Amber, Violet, Pink, Cyan
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <div className="text-slate-400 text-center py-16 bg-white/50 rounded-2xl border border-slate-200 border-dashed">
        <p>{t.noData}</p>
        <p className="text-sm mt-2">{t.logFirst}</p>
      </div>
    );
  }

  // Process Data for Position Frequency
  const positionCounts: Record<string, number> = {};
  data.forEach(log => {
    log.positions.forEach(pos => {
      // Map to translated name
      const translatedPos = t.position[pos] || pos;
      positionCounts[translatedPos] = (positionCounts[translatedPos] || 0) + 1;
    });
  });
  const pieData = Object.keys(positionCounts).map(key => ({
    name: key,
    value: positionCounts[key]
  }));

  // Process Data for Rating Trend
  const trendData = data.slice(-7).map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    rating: log.rating,
    duration: log.durationMinutes
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2 font-serif">
          <PieIcon size={18} className="text-indigo-600" />
          {t.chartPieTitle}
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">{t.chartPieDesc}</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              {entry.name}
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2 font-serif">
          <BarChartIcon size={18} className="text-indigo-600" />
          {t.chartBarTitle}
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">{t.chartBarDesc}</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', color: '#0f172a' }}
              />
              <Bar dataKey="duration" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};