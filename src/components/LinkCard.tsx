import { useState } from 'react';
import { Copy, Check, ExternalLink, BarChart2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface LinkCardProps {
	id: string;
	originalUrl: string;
	shortUrl: string;
	createdAt: string;
	clicks: number;
	onDelete: (id: string) => void;
	onCopy?: (url: string) => void;
	onAnalytics?: (id: string) => void;
}

const LinkCard = ({
	id,
	originalUrl,
	shortUrl,
	createdAt,
	clicks,
	onDelete,
	onCopy,
	onAnalytics,
}: LinkCardProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		if (onCopy) {
			onCopy(shortUrl);
		} else {
			navigator.clipboard.writeText(shortUrl);
			toast.success('Disalin ke clipboard!');
		}

		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	const truncateUrl = (url: string, maxLength = 40) => {
		return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
	};

	const handleDeleteClick = () => {
		// Trigger parent delete handler, which will show the confirmation dialog
		onDelete(id);
	};

	const handleAnalytics = () => {
		if (onAnalytics) {
			onAnalytics(id);
		}
	};

	// Format date
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return new Intl.DateTimeFormat('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			}).format(date);
		} catch (e) {
			return dateString;
		}
	};

	// Extract domain from URL
	const getDomainFromUrl = (url: string) => {
		try {
			const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
			return domainMatch ? domainMatch[1] : url;
		} catch {
			return url;
		}
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-all duration-200">
			<div className="flex items-start justify-between mb-3">
				<div className="overflow-hidden">
					<h3 className="font-medium text-gray-900 mb-1 break-all">{truncateUrl(originalUrl)}</h3>
					<div className="flex items-center text-primary font-medium">
						<span className="truncate">{shortUrl}</span>
					</div>
				</div>
				<div className="flex space-x-1 flex-shrink-0">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-gray-500 hover:text-primary"
						onClick={handleCopy}
					>
						{copied ? <Check size={16} /> : <Copy size={16} />}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-gray-500 hover:text-primary"
						asChild
					>
						<a href={originalUrl} target="_blank" rel="noopener noreferrer">
							<ExternalLink size={16} />
						</a>
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 mt-3 text-sm">
				<div className="flex space-x-4">
					<div className="text-gray-500">Dibuat: {formatDate(createdAt)}</div>
					<div className="flex items-center text-gray-500">
						<BarChart2 size={16} className="mr-1" />
						{clicks} kunjungan
					</div>
				</div>

				<div className="flex space-x-2 mt-2 sm:mt-0">
					<Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleAnalytics}>
						<BarChart2 size={14} className="mr-1" />
						Analitik
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 text-xs text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
						onClick={handleDeleteClick}
					>
						<Trash2 size={14} className="mr-1" />
						Hapus
					</Button>
				</div>
			</div>
		</div>
	);
};

export default LinkCard;
