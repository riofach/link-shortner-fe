import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsGraph from '@/components/StatsGraph';
import BrowserStats from '@/components/BrowserStats';
import CountryStats from '@/components/CountryStats';
import VisitorTable from '@/components/VisitorTable';
import QRCode from '@/components/QRCode';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Copy, Check, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Mock data
const mockClickData = [
	{ date: '2023-05-01', clicks: 12 },
	{ date: '2023-05-02', clicks: 19 },
	{ date: '2023-05-03', clicks: 15 },
	{ date: '2023-05-04', clicks: 27 },
	{ date: '2023-05-05', clicks: 32 },
	{ date: '2023-05-06', clicks: 24 },
	{ date: '2023-05-07', clicks: 18 },
	{ date: '2023-05-08', clicks: 23 },
	{ date: '2023-05-09', clicks: 42 },
	{ date: '2023-05-10', clicks: 35 },
];

const mockBrowserData = [
	{ name: 'Chrome', value: 56, color: '#3B82F6' },
	{ name: 'Safari', value: 24, color: '#10B981' },
	{ name: 'Firefox', value: 12, color: '#F59E0B' },
	{ name: 'Edge', value: 8, color: '#6366F1' },
];

const mockCountryData = [
	{ name: 'United States', visits: 128 },
	{ name: 'Germany', visits: 87 },
	{ name: 'United Kingdom', visits: 65 },
	{ name: 'France', visits: 43 },
	{ name: 'Canada', visits: 38 },
];

const mockVisitorData = [
	{
		id: '1',
		timestamp: '2023-05-10, 14:32:45',
		ipAddress: '192.168.1.1',
		location: 'New York, US',
		device: 'Chrome / Windows',
		referrer: 'google.com',
	},
	{
		id: '2',
		timestamp: '2023-05-10, 13:21:18',
		ipAddress: '192.168.1.2',
		location: 'London, UK',
		device: 'Safari / macOS',
		referrer: 'twitter.com',
	},
	{
		id: '3',
		timestamp: '2023-05-10, 12:45:30',
		ipAddress: '192.168.1.3',
		location: 'Berlin, DE',
		device: 'Firefox / Windows',
		referrer: 'facebook.com',
	},
	{
		id: '4',
		timestamp: '2023-05-10, 11:12:05',
		ipAddress: '192.168.1.4',
		location: 'Paris, FR',
		device: 'Chrome / Android',
		referrer: 'instagram.com',
	},
	{
		id: '5',
		timestamp: '2023-05-10, 10:08:22',
		ipAddress: '192.168.1.5',
		location: 'Toronto, CA',
		device: 'Safari / iOS',
		referrer: 'linkedin.com',
	},
	{
		id: '6',
		timestamp: '2023-05-09, 22:45:18',
		ipAddress: '192.168.1.6',
		location: 'Sydney, AU',
		device: 'Edge / Windows',
		referrer: 'bing.com',
	},
	{
		id: '7',
		timestamp: '2023-05-09, 20:32:40',
		ipAddress: '192.168.1.7',
		location: 'Tokyo, JP',
		device: 'Chrome / Windows',
		referrer: 'yahoo.com',
	},
	{
		id: '8',
		timestamp: '2023-05-09, 18:15:52',
		ipAddress: '192.168.1.8',
		location: 'Mumbai, IN',
		device: 'Chrome / Android',
		referrer: 'direct',
	},
	{
		id: '9',
		timestamp: '2023-05-09, 16:05:34',
		ipAddress: '192.168.1.9',
		location: 'São Paulo, BR',
		device: 'Firefox / Linux',
		referrer: 'youtube.com',
	},
	{
		id: '10',
		timestamp: '2023-05-09, 15:22:17',
		ipAddress: '192.168.1.10',
		location: 'Mexico City, MX',
		device: 'Safari / iOS',
		referrer: 'direct',
	},
	{
		id: '11',
		timestamp: '2023-05-09, 13:48:29',
		ipAddress: '192.168.1.11',
		location: 'Amsterdam, NL',
		device: 'Chrome / macOS',
		referrer: 'google.com',
	},
	{
		id: '12',
		timestamp: '2023-05-09, 10:30:51',
		ipAddress: '192.168.1.12',
		location: 'Rome, IT',
		device: 'Safari / iOS',
		referrer: 'direct',
	},
];

const Analytics = () => {
	const { id } = useParams();
	const [timeframe, setTimeframe] = useState('7days');
	const [copied, setCopied] = useState(false);

	// In a real app, we would fetch the URL data based on the ID
	const urlData = {
		id: id || '1',
		originalUrl: 'https://www.example.com/very/long/url/that/needs/to/be/shortened',
		shortUrl: 'linkstride.com/abc123',
		createdAt: '2023-05-01T12:00:00Z',
		totalClicks: 247,
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(`https://${urlData.shortUrl}`);
		setCopied(true);
		toast.success('Copied to clipboard!');

		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	const handleShare = (platform: string) => {
		// In a real app, this would open a share dialog
		toast.success(`Shared on ${platform}`);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Navbar />

			<main className="flex-grow py-12 px-6">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<Link
							to="/dashboard"
							className="inline-flex items-center text-gray-600 hover:text-primary mb-4"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Dashboard
						</Link>

						<div className="bg-white border border-gray-200 rounded-xl p-6">
							<div className="flex flex-col md:flex-row justify-between">
								<div>
									<h1 className="text-2xl font-bold text-gray-900 mb-2 break-all">
										{urlData.originalUrl}
									</h1>
									<div className="flex items-center text-primary font-medium">
										<span>{urlData.shortUrl}</span>
										<button className="ml-2 text-gray-500 hover:text-gray-700" onClick={handleCopy}>
											{copied ? <Check size={16} /> : <Copy size={16} />}
										</button>
									</div>
								</div>

								<div className="mt-4 md:mt-0 flex items-center space-x-2">
									<div className="bg-white border border-gray-200 rounded-lg flex p-1">
										<button
											className="p-2 hover:bg-gray-100 rounded text-blue-600"
											onClick={() => handleShare('Facebook')}
										>
											<Facebook size={18} />
										</button>
										<button
											className="p-2 hover:bg-gray-100 rounded text-sky-500"
											onClick={() => handleShare('Twitter')}
										>
											<Twitter size={18} />
										</button>
										<button
											className="p-2 hover:bg-gray-100 rounded text-blue-700"
											onClick={() => handleShare('LinkedIn')}
										>
											<Linkedin size={18} />
										</button>
										<button
											className="p-2 hover:bg-gray-100 rounded text-gray-700"
											onClick={() => {}}
										>
											<Share2 size={18} />
										</button>
									</div>

									<Button variant="outline">Edit Link</Button>
								</div>
							</div>

							<div className="flex flex-wrap gap-4 mt-6 border-t border-gray-100 pt-6 text-sm">
								<div>
									<span className="text-gray-500">Created:</span>{' '}
									<span className="font-medium">
										{new Date(urlData.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div>
									<span className="text-gray-500">Total Clicks:</span>{' '}
									<span className="font-medium">{urlData.totalClicks}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Analytics Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="md:col-span-2">
							<StatsGraph
								data={mockClickData}
								timeframe={timeframe}
								onTimeframeChange={setTimeframe}
							/>
						</div>

						<div>
							<QRCode url={urlData.shortUrl} />
						</div>

						<div>
							<BrowserStats data={mockBrowserData} />
						</div>

						<div>
							<CountryStats data={mockCountryData} />
						</div>

						<div className="md:col-span-3">
							<VisitorTable visitors={mockVisitorData} />
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Analytics;
