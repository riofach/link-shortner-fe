import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import LinkCard from '@/components/LinkCard';
import UrlModal from '@/components/UrlModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	BarChart3,
	Link2,
	Users,
	Globe,
	Plus,
	Search,
	SlidersHorizontal,
	Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { urlAPI, authAPI, subscriptionAPI } from '@/lib/api';
import UpgradePrompt from '@/components/UpgradePrompt';

interface UrlData {
	code: string;
	originalUrl: string;
	shortUrl: string;
	createdAt: string;
	clicks?: number;
}

interface UserProfile {
	user: {
		id: string;
		email: string;
		name: string | null;
		createdAt: string;
	};
	stats: {
		totalUrls: number;
		totalClicks: number;
	};
}

interface DashboardStats {
	basicStats: {
		totalUrls: number;
		totalClicks: number;
		uniqueVisitors: number;
	};
	trends: {
		urlGrowth: number;
		clickGrowth: number;
		visitorGrowth: number;
		urlTrend: Array<{ date: string; count: string }>;
		clickTrend: Array<{ date: string; count: string }>;
	};
	demographics: {
		browsers: Array<{ browser: string; count: string }>;
		countries: Array<{ country: string; count: string }>;
		topCountry: {
			name: string;
			percentage: number;
		};
	};
}

interface SubscriptionData {
	subscription: {
		id: number;
		plan_type: string;
		start_date: string;
		end_date: string | null;
	};
	limits: {
		links_per_day: number;
		links_created_today: number;
		custom_code_allowed: boolean;
		analytics_allowed: boolean;
	};
}

// Fungsi untuk memformat tanggal
const formatDate = (dateString: string) => {
	if (!dateString) return '';
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
};

const Dashboard = () => {
	const [links, setLinks] = useState<UrlData[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
	const [deleteUrlData, setDeleteUrlData] = useState<{ code: string; url: string } | null>(null);
	const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		// Periksa jika pengguna sudah login
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		fetchProfile();
		fetchDashboardStats();
		fetchLinks();
		fetchSubscriptionData();
	}, [navigate]);

	// Tambahkan fungsi retry untuk fetch dengan exponential backoff
	const fetchWithRetry = async <T,>(fetchFn: () => Promise<T>, maxRetries = 3): Promise<T> => {
		let retries = 0;
		while (retries < maxRetries) {
			try {
				return await fetchFn();
			} catch (error) {
				console.error(`Error on attempt ${retries + 1}:`, error);
				retries++;
				if (retries >= maxRetries) throw error;
				// Exponential backoff: 1s, 2s, 4s, ...
				await new Promise((r) => setTimeout(r, Math.pow(2, retries) * 1000));
			}
		}
		throw new Error('Failed after all retry attempts');
	};

	const fetchProfile = async () => {
		try {
			const data = await fetchWithRetry(() => authAPI.getProfile());
			setProfile(data);
		} catch (error) {
			console.error('Error fetching profile:', error);
			toast.error('Gagal memuat profil pengguna');
		}
	};

	const fetchDashboardStats = async () => {
		try {
			const data = await fetchWithRetry(() => urlAPI.getDashboardStats());
			setDashboardStats(data);
		} catch (error) {
			console.error('Error fetching dashboard stats:', error);
			toast.error('Gagal memuat statistik dasbor');
		}
	};

	const fetchLinks = async () => {
		setIsLoading(true);
		try {
			const data = await fetchWithRetry(() => urlAPI.getUserUrls());
			setLinks(data);
			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			toast.error('Gagal memuat data URL');
			console.error('Error fetching links:', error);
		}
	};

	const fetchSubscriptionData = async () => {
		try {
			const data = await fetchWithRetry(() => subscriptionAPI.getUserSubscription());
			setSubscription(data);
		} catch (error) {
			console.error('Error fetching subscription data:', error);
		}
	};

	const filteredLinks = links.filter(
		(link) =>
			link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
			link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
			link.code.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCreateLink = async (data: { url: string; customAlias?: string }) => {
		try {
			const newLink = await urlAPI.createShortUrl(data.url, data.customAlias);
			setLinks([newLink, ...links]);
			setIsModalOpen(false);
			toast.success('URL berhasil dibuat!');

			// Refresh profile dan stats untuk mendapatkan data terbaru
			fetchProfile();
			fetchDashboardStats();
			fetchSubscriptionData();
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'response' in error &&
				error.response &&
				typeof error.response === 'object' &&
				'data' in error.response &&
				error.response.data &&
				typeof error.response.data === 'object' &&
				'error' in error.response.data
			) {
				toast.error(String(error.response.data.error));
			} else {
				toast.error('Gagal membuat URL pendek');
			}
		}
	};

	const handleDeleteLink = async (code: string) => {
		// Find the URL to be deleted to show in the confirmation dialog
		const linkToDelete = links.find((link) => link.code === code);
		if (linkToDelete) {
			setDeleteUrlData({
				code,
				url: linkToDelete.shortUrl,
			});
		}
	};

	const confirmDeleteLink = async () => {
		if (!deleteUrlData) return;

		try {
			await urlAPI.deleteUrl(deleteUrlData.code);
			setLinks(links.filter((link) => link.code !== deleteUrlData.code));
			toast.success('URL berhasil dihapus!');

			// Refresh profile dan stats untuk mendapatkan data terbaru
			fetchProfile();
			fetchDashboardStats();
		} catch (error) {
			toast.error('Gagal menghapus URL');
		}

		// Reset delete data
		setDeleteUrlData(null);
	};

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success('URL disalin ke clipboard!');
	};

	const formatDateString = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(date);
	};

	// Check if user is on free plan
	const isFreePlan =
		!subscription?.subscription?.plan_type || subscription?.subscription?.plan_type === 'free';
	const showCustomCodeField = !isFreePlan || subscription?.limits?.custom_code_allowed;
	const linksPerDay = subscription?.limits?.links_per_day || 3;
	const linksCreatedToday = subscription?.limits?.links_created_today || 0;
	const isLimitReached = isFreePlan && linksPerDay > 0 && linksCreatedToday >= linksPerDay;

	// Format subscription end date
	const subscriptionEndDate = subscription?.subscription?.end_date
		? formatDate(subscription.subscription.end_date)
		: null;

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Navbar />

			<main className="flex-grow py-12 px-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
							<p className="text-gray-600">Kelola dan lacak tautan pendek Anda</p>
						</div>
						<Button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0">
							<Plus className="mr-2 h-4 w-4" />
							Tautan Baru
						</Button>
					</div>

					{/* Subscription Status */}
					{subscription && (
						<div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex justify-between items-center">
							<div>
								<h3 className="font-medium">
									Status Langganan:
									<span
										className={`ml-2 ${
											isFreePlan ? 'text-gray-600' : 'text-green-600 font-semibold'
										}`}
									>
										{isFreePlan ? 'Free' : 'Pro'}
									</span>
								</h3>
								{!isFreePlan && subscriptionEndDate && (
									<p className="text-sm text-gray-600">Aktif hingga: {subscriptionEndDate}</p>
								)}
							</div>
							{isFreePlan && (
								<Link to="/pricing">
									<Button variant="outline" size="sm">
										Upgrade ke Pro
									</Button>
								</Link>
							)}
						</div>
					)}

					{/* Stats Summary - Now using real-time data */}
					{dashboardStats && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<StatsCard
								title="Total Tautan"
								value={dashboardStats.basicStats.totalUrls}
								icon={<Link2 size={24} />}
								trend={dashboardStats.trends.urlGrowth}
								trendLabel="bulan ini"
							/>
							<StatsCard
								title="Total Kunjungan"
								value={dashboardStats.basicStats.totalClicks}
								icon={<BarChart3 size={24} />}
								trend={dashboardStats.trends.clickGrowth}
								trendLabel="bulan ini"
							/>
							<StatsCard
								title="Pengunjung Unik"
								value={dashboardStats.basicStats.uniqueVisitors}
								icon={<Users size={24} />}
								trend={dashboardStats.trends.visitorGrowth}
								trendLabel="bulan ini"
							/>
							<StatsCard
								title="Negara Teratas"
								value={`${dashboardStats.demographics.topCountry.name} (${dashboardStats.demographics.topCountry.percentage}%)`}
								icon={<Globe size={24} />}
							/>
						</div>
					)}

					{/* Use fallback to old data if dashboard stats not available */}
					{!dashboardStats && profile && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<StatsCard
								title="Total Tautan"
								value={profile.stats.totalUrls}
								icon={<Link2 size={24} />}
								trend={12}
								trendLabel="bulan ini"
							/>
							<StatsCard
								title="Total Kunjungan"
								value={profile.stats.totalClicks}
								icon={<BarChart3 size={24} />}
								trend={8}
								trendLabel="bulan ini"
							/>
							<StatsCard
								title="Pengunjung Unik"
								value={Math.floor(profile.stats.totalClicks * 0.7)}
								icon={<Users size={24} />}
								trend={-3}
								trendLabel="bulan ini"
							/>
							<StatsCard
								title="Negara Teratas"
								value="Indonesia (42%)"
								icon={<Globe size={24} />}
							/>
						</div>
					)}

					{/* Upgrade prompt for free users */}
					{isFreePlan && (
						<UpgradePrompt
							message={
								isLimitReached
									? `Anda telah mencapai batas pembuatan link harian (${linksCreatedToday}/${linksPerDay}). Upgrade ke Pro untuk membuat link tanpa batas!`
									: 'Upgrade ke paket Pro untuk akses ke kode kustom, analytics lengkap, dan link tanpa batas.'
							}
						/>
					)}

					{/* Links Management */}
					<div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
						<div className="p-6 border-b border-gray-200">
							<h2 className="text-lg font-semibold text-gray-900">Tautan Anda</h2>

							<div className="mt-4 flex flex-col sm:flex-row gap-4">
								<div className="relative flex-grow">
									<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
									<Input
										placeholder="Cari tautan..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>
								<Button variant="outline" className="flex-shrink-0">
									<SlidersHorizontal className="mr-2 h-4 w-4" />
									Filter
								</Button>
							</div>
						</div>

						<div className="p-6 divide-y divide-gray-100">
							{isLoading ? (
								<div className="py-8 text-center">
									<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
									<p className="text-gray-500 mt-2">Memuat data...</p>
								</div>
							) : filteredLinks.length > 0 ? (
								filteredLinks.map((link) => (
									<div key={link.code} className="py-4 first:pt-0 last:pb-0">
										<LinkCard
											id={link.code}
											originalUrl={link.originalUrl}
											shortUrl={link.shortUrl}
											createdAt={link.createdAt}
											clicks={link.clicks || 0}
											onDelete={handleDeleteLink}
											onCopy={handleCopy}
											onAnalytics={(id) => navigate(`/analytics/${id}`)}
										/>
									</div>
								))
							) : (
								<div className="py-8 text-center">
									<p className="text-gray-500">Belum ada tautan yang ditemukan</p>
									<Button onClick={() => setIsModalOpen(true)} className="mt-4">
										Buat Tautan Pertama
									</Button>
								</div>
							)}
						</div>

						{/* Pagination */}
						{filteredLinks.length > 0 && (
							<div className="p-6 border-t border-gray-100 flex justify-between items-center text-sm">
								<div className="text-gray-500">
									Menampilkan {filteredLinks.length} dari {links.length} tautan
								</div>
								<div className="flex space-x-1">
									<Button variant="outline" size="sm" disabled>
										Sebelumnya
									</Button>
									<Button variant="outline" size="sm" disabled>
										Selanjutnya
									</Button>
								</div>
							</div>
						)}
					</div>

					{/* Browser Distribution - Tampilkan jika data tersedia */}
					{dashboardStats && dashboardStats.demographics.browsers.length > 0 && (
						<div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Browser</h2>
							<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
								{dashboardStats.demographics.browsers.map((browser, index) => (
									<div key={index} className="bg-gray-50 p-4 rounded-lg">
										<div className="text-sm font-medium text-gray-500">{browser.browser}</div>
										<div className="mt-1 text-xl font-semibold">{browser.count} kunjungan</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Modals */}
				<UrlModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleCreateLink}
				/>

				{/* Delete Confirmation Dialog */}
				<DeleteConfirmDialog
					isOpen={!!deleteUrlData}
					onClose={() => setDeleteUrlData(null)}
					onConfirm={confirmDeleteLink}
					title="Konfirmasi Hapus Tautan"
					description={
						deleteUrlData
							? `Apakah Anda yakin ingin menghapus tautan "${deleteUrlData.url}"? Tindakan ini tidak dapat dibatalkan.`
							: ''
					}
					cancelText="Batal"
					confirmText="Hapus"
				/>
			</main>

			<Footer />
		</div>
	);
};

export default Dashboard;
