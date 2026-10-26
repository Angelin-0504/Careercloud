import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      borderHover: 'hover:border-indigo-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      borderHover: 'hover:border-emerald-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      borderHover: 'hover:border-amber-200',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      borderHover: 'hover:border-blue-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      borderHover: 'hover:border-purple-200',
    },
  }[color];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all duration-200 ${colorMap.borderHover}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-normal">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colorMap.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
