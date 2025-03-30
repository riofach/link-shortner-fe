
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
}

const StatsCard = ({ title, value, icon, trend, trendLabel }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover-scale">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
          
          {trend !== undefined && (
            <p className={`text-xs flex items-center mt-2 ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
              <span className="ml-1">
                {Math.abs(trend)}% {trendLabel || 'vs. last period'}
              </span>
            </p>
          )}
        </div>
        <div className="bg-blue-50 h-12 w-12 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
