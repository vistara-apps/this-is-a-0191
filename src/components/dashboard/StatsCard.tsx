import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-surface rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {subtitle && (
            <p className="text-text-secondary text-sm">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};