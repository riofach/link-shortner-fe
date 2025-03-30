
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CountryData {
  name: string;
  visits: number;
}

interface CountryStatsProps {
  data: CountryData[];
}

const CountryStats = ({ data }: CountryStatsProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Top Countries</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid horizontal={true} vertical={false} stroke="#f5f5f5" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 12 }} 
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #f3f4f6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="visits" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CountryStats;
