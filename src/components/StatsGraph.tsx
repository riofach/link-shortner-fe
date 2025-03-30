
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClickData {
  date: string;
  clicks: number;
}

interface StatsGraphProps {
  data: ClickData[];
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const StatsGraph = ({ data, timeframe, onTimeframeChange }: StatsGraphProps) => {
  const timeframes = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900">Click Analytics</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === tf.value 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => onTimeframeChange(tf.value)}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <CartesianGrid vertical={false} stroke="#f5f5f5" />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #f3f4f6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorClicks)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsGraph;
