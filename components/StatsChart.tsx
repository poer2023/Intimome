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

interface StatsChartProps {
  data: SessionLog[];
}

// Diverse Palette matching reference design
const COLORS = ['#c084fc', '#60a5fa', '#fda4af', '#f43f5e', '#a78bfa'];

export const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <div className="text-slate-400 text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
        <p className="font-medium">{t.noData}</p>
        <p className="text-sm mt-2">{t.logFirst}</p>
      </div>
    );
  }

  // Process Data for Position Frequency
  const positionCounts: Record<string, number> = {};
  data.forEach(log => {
    log.positions.forEach(pos => {
      const translatedPos = t.position[pos] || pos;
      positionCounts[translatedPos] = (positionCounts[translatedPos] || 0) + 1;
    });
  });
  const pieData = Object.keys(positionCounts).map(key => ({
    name: key,
    value: positionCounts[key]
  }));

  // Process Data for Duration Trend (take latest 7, reverse for chronological order left-to-right)
  const trendData = data.slice(0, 7).reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    duration: log.durationMinutes
  }));

  return (
    <div className="space-y-6">
      {/* Duration Trends Card */}
      <div className="bg-white rounded-[20px] p-6 shadow-subtle border border-slate-100">
        <h3 className="text-base font-semibold text-slate-900 mb-6">Duration Trends</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#cbd5e1"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                stroke="#cbd5e1"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />
              <Tooltip
                cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#f1f5f9',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
                  padding: '8px 12px'
                }}
                labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}
                itemStyle={{ color: '#64748b', fontSize: 12 }}
              />
              <Bar
                dataKey="duration"
                fill="#f43f5e"
                radius={[6, 6, 6, 6]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Position Breakdown Card */}
      <div className="bg-white rounded-[20px] p-6 shadow-subtle border border-slate-100">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Position Breakdown</h3>
        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#f1f5f9',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
                  padding: '8px 12px'
                }}
                itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-slate-600">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};