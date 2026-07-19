import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'gold' | 'blue' | 'green' | 'purple' | 'red';
}

const colorMap = {
  gold: {
    bg: 'bg-brand-gold/10',
    border: 'border-brand-gold/20',
    icon: 'text-brand-gold',
    value: 'text-brand-gold',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    value: 'text-blue-400',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    value: 'text-emerald-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    value: 'text-purple-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    value: 'text-red-400',
  },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'gold' }) => {
  const c = colorMap[color];
  return (
    <div className={`p-5 rounded-2xl border ${c.bg} ${c.border} flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.icon} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mb-1">{label}</p>
        <p className={`text-3xl font-black font-display ${c.value}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
