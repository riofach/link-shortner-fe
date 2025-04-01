import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
	ArrowLeft,
	Copy,
	Check,
	BarChart,
	BarChart3,
	Users,
	Calendar,
	Globe,
	Clock,
	Loader2,
	Share2,
	Facebook,
	Twitter,
	Linkedin,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { urlAPI, subscriptionAPI } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UrlStats {
	url: {
		code: string;
		originalUrl: string;
		shortUrl: string;
		createdAt: string;
	};
	stats: {
		totalHits: number;
		uniqueVisitors: number;
		lastAccessed: string | null;
		recentHits: {
			ip_address: string;
			accessed_at: string;
		}[];
	};
}

interface SubscriptionData {
	subscription: {
		id: number;
		plan_type: string;
	};
	limits: {
		links_per_day: number;
		links_created_today: number;
		custom_code_allowed: boolean;
		analytics_allowed: boolean;
	};
}

const Analytics = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState<UrlStats | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [timeframe] = useState('7days');
	const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

	useEffect(() => {
		// Periksa jika pengguna sudah login
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		if (id) {
			fetchStats(id);
		}

		// Fetch subscription data
		const fetchData = async () => {
			if (!id) {
				navigate('/dashboard');
				return;
			}

			// Fetch subscription data
			try {
				const subscriptionData = await subscriptionAPI.getUserSubscription();
				setSubscription(subscriptionData);

				// Jika pengguna tidak memiliki akses analitik, redirect ke pricing
				if (
					subscriptionData?.subscription?.plan_type !== 'pro' &&
					!subscriptionData?.limits?.analytics_allowed
				) {
					toast.error('Analitik hanya tersedia untuk pengguna Pro', {
						action: {
							label: 'Upgrade',
							onClick: () => navigate('/pricing'),
						},
					});
					setTimeout(() => navigate('/pricing'), 3000);
					return;
				}

				// Fetch stats if user has analytics access
				fetchStats(id);
			} catch (error) {
				console.error('Error fetching subscription data:', error);
				// Try to fetch stats anyway in case of subscription API error
				fetchStats(id);
			}
		};

		fetchData();
	}, [id, navigate]);

	const fetchStats = async (code: string) => {
		setIsLoading(true);
		try {
			const response = await urlAPI.getUrlStats(code);
			setStats(response);
		} catch (error: unknown) {
			console.error('Error fetching stats:', error);

			if (
				error &&
				typeof error === 'object' &&
				'response' in error &&
				error.response &&
				typeof error.response === 'object' &&
				'status' in error.response &&
				error.response.status === 403 &&
				'data' in error.response &&
				error.response.data &&
				typeof error.response.data === 'object' &&
				'upgradeToPro' in error.response.data
			) {
				toast.error('Analitik hanya tersedia untuk pengguna Pro', {
					action: {
						label: 'Upgrade',
						onClick: () => navigate('/pricing'),
					},
				});
				setTimeout(() => navigate('/pricing'), 3000);
			} else {
				const errorMessage =
					error &&
					typeof error === 'object' &&
					'response' in error &&
					error.response &&
					typeof error.response === 'object' &&
					'data' in error.response &&
					error.response.data &&
					typeof error.response.data === 'object' &&
					'message' in error.response.data
						? String(error.response.data.message)
						: 'Tidak dapat mengambil statistik URL';

				toast.error(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url);
		setCopied(true);
		toast.success('URL disalin ke clipboard!');

		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	const handleShare = (platform: string) => {
		let shareUrl = '';

		if (stats) {
			if (platform === 'Facebook') {
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					stats.url.shortUrl
				)}`;
			} else if (platform === 'Twitter') {
				shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(stats.url.shortUrl)}`;
			} else if (platform === 'LinkedIn') {
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
					stats.url.shortUrl
				)}`;
			}

			if (shareUrl) {
				window.open(shareUrl, '_blank');
			}
		}

		toast.success(`Dibagikan ke ${platform}`);
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Belum pernah diakses';

		const date = new Date(dateString);
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	const formatIpAddress = (ip: string) => {
		// Samarkan dua oktet terakhir untuk privasi
		return ip
			.split('.')
			.map((octet, index) => (index >= 2 ? 'xxx' : octet))
			.join('.');
	};

	// Buat data dummy untuk grafik jika diperlukan
	// Dalam implementasi sebenarnya, data ini harus berasal dari backend
	const generateMockClickData = () => {
		const data = [];
		const today = new Date();

		for (let i = 9; i >= 0; i--) {
			const date = new Date();
			date.setDate(today.getDate() - i);
			const clickCount = stats
				? Math.max(1, Math.floor((stats.stats.totalHits * Math.random()) / 10))
				: 0;

			data.push({
				date: date.toISOString().split('T')[0],
				clicks: clickCount,
			});
		}

		return data;
	};

	// Buat data browser dummy
	const generateMockBrowserData = () => {
		return [
			{ name: 'Chrome', value: 65, color: '#3B82F6' },
			{ name: 'Safari', value: 20, color: '#10B981' },
			{ name: 'Firefox', value: 10, color: '#F59E0B' },
			{ name: 'Edge', value: 5, color: '#6366F1' },
		];
	};

	if (
		subscription &&
		subscription.subscription?.plan_type !== 'pro' &&
		!subscription.limits?.analytics_allowed
	) {
		return (
			<div className="flex min-h-screen flex-col">
				<Navbar />
				<div className="container py-10 flex flex-col items-center justify-center flex-1">
					<div className="max-w-md text-center">
						<h1 className="text-3xl font-bold">Upgrade ke Pro</h1>
						<p className="mt-4 text-gray-600">
							Analitik terperinci hanya tersedia untuk pengguna Pro. Upgrade sekarang untuk akses ke
							semua fitur premium.
						</p>
						<Button onClick={() => navigate('/pricing')} className="mt-6">
							Lihat Paket Pro
						</Button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

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

						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : error ? (
							<div className="text-center py-12">
								<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md mx-auto">
									<h2 className="text-xl font-bold text-gray-900 mb-4">{error}</h2>
									<p className="text-gray-600 mb-6">
										URL yang Anda cari mungkin tidak ada atau tidak dapat diakses.
									</p>
									<Button asChild>
										<Link to="/dashboard">Back to Dashboard</Link>
									</Button>
								</div>
							</div>
						) : stats ? (
							<>
								<div className="bg-white border border-gray-200 rounded-xl p-6">
									<div className="flex flex-col md:flex-row justify-between">
										<div>
											<h1 className="text-2xl font-bold text-gray-900 mb-2 break-all">
												{stats.url.originalUrl}
											</h1>
											<div className="flex items-center text-primary font-medium">
												<span>{stats.url.shortUrl}</span>
												<button
													className="ml-2 text-gray-500 hover:text-gray-700"
													onClick={() => handleCopy(stats.url.shortUrl)}
												>
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
											</div>
										</div>
									</div>

									<div className="flex flex-wrap gap-4 mt-6 border-t border-gray-100 pt-6 text-sm">
										<div>
											<span className="text-gray-500">Created:</span>{' '}
											<span className="font-medium">{formatDate(stats.url.createdAt)}</span>
										</div>
										<div>
											<span className="text-gray-500">Total Visits:</span>{' '}
											<span className="font-medium">{stats.stats.totalHits}</span>
										</div>
										<div>
											<span className="text-gray-500">Unique Visitors:</span>{' '}
											<span className="font-medium">{stats.stats.uniqueVisitors}</span>
										</div>
										<div>
											<span className="text-gray-500">Last Accessed:</span>{' '}
											<span className="font-medium">{formatDate(stats.stats.lastAccessed)}</span>
										</div>
									</div>
								</div>

								{/* Stats Grid */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
									<div className="md:col-span-3">
										<div className="bg-white rounded-xl border border-gray-200 p-6">
											<div className="flex flex-col md:flex-row justify-between items-center mb-6">
												<h2 className="text-lg font-semibold text-gray-900">Visit Statistics</h2>
												<div className="inline-flex items-center space-x-2 mt-2 md:mt-0">
													<Button variant="outline" size="sm" className="h-8">
														7 Days
													</Button>
													<Button variant="ghost" size="sm" className="h-8">
														30 Days
													</Button>
													<Button variant="ghost" size="sm" className="h-8">
														90 Days
													</Button>
												</div>
											</div>

											<div className="h-64 flex items-center justify-center">
												<div className="text-center text-gray-500">
													<BarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
													<p>Graph statistics data is not available at the moment.</p>
													<p className="text-sm">You can see the visit history below.</p>
												</div>
											</div>
										</div>
									</div>

									<div>
										<div className="bg-white rounded-xl border border-gray-200 p-6">
											<h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
											<div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-lg">
												<div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
													<img
														src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
															stats.url.shortUrl
														)}`}
														alt="QR Code"
														className="max-w-full max-h-full"
													/>
												</div>
												<Button
													className="mt-4"
													variant="outline"
													size="sm"
													onClick={() => handleCopy(stats.url.shortUrl)}
												>
													<Copy className="h-4 w-4 mr-2" /> Copy URL
												</Button>
											</div>
										</div>
									</div>

									<div className="md:col-span-2">
										<div className="bg-white rounded-xl border border-gray-200 p-6">
											<h2 className="text-lg font-semibold text-gray-900 mb-6">
												Latest Visit History
											</h2>

											{stats.stats.recentHits.length > 0 ? (
												<div className="overflow-x-auto">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Visitor IP</TableHead>
																<TableHead className="text-right">Access Time</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{stats.stats.recentHits.map((hit, index) => (
																<TableRow key={index}>
																	<TableCell className="font-medium">
																		{formatIpAddress(hit.ip_address)}
																	</TableCell>
																	<TableCell className="text-right">
																		{formatDate(hit.accessed_at)}
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											) : (
												<div className="p-8 text-center">
													<p className="text-gray-500">No visits yet on this URL</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</>
						) : null}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Analytics;
