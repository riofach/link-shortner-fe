import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { urlAPI, subscriptionAPI } from '@/lib/api';

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

const UrlShortener = () => {
	const [url, setUrl] = useState('');
	const [customCode, setCustomCode] = useState('');
	const [shortUrl, setShortUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// Periksa status login
		const token = localStorage.getItem('token');
		setIsLoggedIn(!!token);

		// Ambil data langganan jika login
		if (token) {
			fetchSubscriptionData();
		}
	}, []);

	const fetchSubscriptionData = async () => {
		try {
			const data = await subscriptionAPI.getUserSubscription();
			setSubscription(data);
		} catch (error) {
			console.error('Error fetching subscription data:', error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate URL
		if (!url) {
			toast.error('Silakan masukkan URL');
			return;
		}

		try {
			// Basic URL validation
			new URL(url);
		} catch (error) {
			toast.error('Silakan masukkan URL yang valid');
			return;
		}

		// Jika pengguna tidak login dan mencoba menggunakan kode kustom
		if (!isLoggedIn && customCode) {
			toast.error('Login diperlukan untuk menggunakan kode kustom', {
				action: {
					label: 'Login',
					onClick: () => navigate('/login'),
				},
			});
			return;
		}

		// Jika pengguna login dengan paket free dan mencoba menggunakan kode kustom
		const isPro = subscription?.subscription?.plan_type === 'pro';
		if (isLoggedIn && !isPro && customCode) {
			toast.error('Kode kustom hanya tersedia untuk pengguna Pro', {
				action: {
					label: 'Upgrade',
					onClick: () => navigate('/pricing'),
				},
			});
			return;
		}

		setIsLoading(true);

		try {
			// Panggil API untuk membuat URL pendek
			const data = await urlAPI.createShortUrl(url, customCode || undefined);
			setShortUrl(data.shortUrl);

			// Refresh subscription data untuk memperbarui jumlah link yang tersisa
			if (isLoggedIn) {
				fetchSubscriptionData();
			}

			setIsLoading(false);
			toast.success('URL Berhasil Dipendekkan!');
		} catch (error: unknown) {
			setIsLoading(false);

			// Cek apakah error terkait batas penggunaan
			if (
				error &&
				typeof error === 'object' &&
				'response' in error &&
				error.response &&
				typeof error.response === 'object' &&
				'data' in error.response &&
				error.response.data &&
				typeof error.response.data === 'object' &&
				'upgradeToPro' in error.response.data
			) {
				const errorMessage =
					error.response.data &&
					typeof error.response.data === 'object' &&
					'message' in error.response.data
						? String(error.response.data.message)
						: 'Anda telah mencapai batas pembuatan link';

				toast.error(errorMessage, {
					action: {
						label: 'Upgrade',
						onClick: () => navigate('/pricing'),
					},
				});
			} else if (
				error &&
				typeof error === 'object' &&
				'response' in error &&
				error.response &&
				typeof error.response === 'object' &&
				'data' in error.response &&
				error.response.data &&
				typeof error.response.data === 'object' &&
				'message' in error.response.data
			) {
				toast.error(String(error.response.data.message));
			} else {
				toast.error('Gagal memendekkan URL. Silakan coba lagi.');
			}
		}
	};

	const handleCopy = () => {
		if (!shortUrl) return;

		navigator.clipboard.writeText(shortUrl);
		setCopied(true);
		toast.success('Disalin ke clipboard!');

		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	// Periksa apakah pengguna bisa menggunakan custom code
	const canUseCustomCode = !isLoggedIn || (subscription?.limits?.custom_code_allowed ?? false);

	// Hitung batas penggunaan
	const isFreePlan =
		isLoggedIn &&
		(!subscription?.subscription?.plan_type || subscription?.subscription?.plan_type === 'free');
	const linksPerDay = subscription?.limits?.links_per_day || 3;
	const linksCreatedToday = subscription?.limits?.links_created_today || 0;
	const isLimitReached = isFreePlan && linksPerDay > 0 && linksCreatedToday >= linksPerDay;

	return (
		<div className="p-6 md:p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
			<h2 className="text-2xl font-bold mb-4">Pendekkan URL Anda</h2>

			{isFreePlan && (
				<div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center text-sm">
					<Sparkles className="h-4 w-4 text-primary mr-2" />
					<div className="flex-1">
						{isLimitReached
							? `Anda telah mencapai batas harian (${linksCreatedToday}/${linksPerDay}).`
							: `Sisa kuota: ${linksCreatedToday}/${linksPerDay} link hari ini.`}
					</div>
					<Button size="sm" variant="outline" onClick={() => navigate('/pricing')} className="ml-2">
						Upgrade
					</Button>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
						URL Asli
					</label>
					<Input
						id="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://contoh.com/url-yang-sangat-panjang-dan-perlu-dipendekkan"
						disabled={isLoading || isLimitReached}
					/>
				</div>

				<div>
					<label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
						Kode Kustom (opsional)
						{!canUseCustomCode && <span className="ml-2 text-xs text-amber-600">(Fitur Pro)</span>}
					</label>
					<Input
						id="customCode"
						value={customCode}
						onChange={(e) => setCustomCode(e.target.value)}
						placeholder="kode-kustom-saya"
						disabled={isLoading || !canUseCustomCode || isLimitReached}
					/>
					<p className="mt-1 text-sm text-gray-500">Biarkan kosong untuk mendapatkan kode acak</p>
				</div>

				<Button type="submit" disabled={isLoading || isLimitReached} className="w-full">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Memproses...
						</>
					) : (
						'Pendekkan URL'
					)}
				</Button>
			</form>

			{shortUrl && (
				<div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
					<p className="text-sm font-medium text-gray-700 mb-2">URL Pendek Anda:</p>
					<div className="flex items-center">
						<code className="flex-1 font-mono text-sm bg-white p-2 rounded border border-gray-200 overflow-x-auto">
							{shortUrl}
						</code>
						<Button variant="ghost" size="icon" onClick={handleCopy} className="ml-2 flex-shrink-0">
							{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default UrlShortener;
