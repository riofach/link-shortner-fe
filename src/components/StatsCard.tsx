import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
	title: string;
	value: number | string;
	icon?: React.ReactNode;
	trend?: number;
	trendLabel?: string;
}

const StatsCard = ({ title, value, icon, trend, trendLabel }: StatsCardProps) => {
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-medium text-gray-700">{title}</h3>
				{icon && <div className="text-gray-500">{icon}</div>}
			</div>
			<div className="mb-2">
				<p className="text-2xl font-bold text-gray-900">{value}</p>
			</div>
			{trend !== undefined && (
				<div className="flex items-center text-sm">
					{trend > 0 ? (
						<div className="flex items-center text-green-600">
							<ArrowUp size={14} className="mr-1" />
							<span>{trend}%</span>
						</div>
					) : trend < 0 ? (
						<div className="flex items-center text-red-600">
							<ArrowDown size={14} className="mr-1" />
							<span>{Math.abs(trend)}%</span>
						</div>
					) : (
						<div className="text-gray-500">0%</div>
					)}
					{trendLabel && <span className="text-gray-500 ml-1">{trendLabel}</span>}
				</div>
			)}
		</div>
	);
};

export default StatsCard;
