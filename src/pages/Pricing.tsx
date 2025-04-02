import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { subscriptionAPI } from '@/lib/api';

interface PlanFeature {
	name: string;
	includedInFree: boolean;
	includedInPro: boolean;
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

interface PendingPaymentData {
	hasPendingPayment: boolean;
	paymentId?: number;
	orderId?: string;
	createdAt?: string;
	timestamp?: number;
}

const features: PlanFeature[] = [
	{ name: 'Pembuatan Tautan Pendek', includedInFree: true, includedInPro: true },
	{ name: 'Kuota Tautan (per hari)', includedInFree: true, includedInPro: true },
	{ name: 'Kode Kustom', includedInFree: false, includedInPro: true },
	{ name: 'Dashboard Analitik Lengkap', includedInFree: false, includedInPro: true },
	{ name: 'Statistik Lalu Lintas', includedInFree: false, includedInPro: true },
	{ name: 'Tanpa Batasan Kuota Harian', includedInFree: false, includedInPro: true },
	{ name: 'Dukungan Premium', includedInFree: false, includedInPro: true },
];

const Pricing: React.FC = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [hasPendingPayment, setHasPendingPayment] = useState(false);
	const [pendingPaymentData, setPendingPaymentData] = useState<PendingPaymentData | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			setIsLoggedIn(true);
			fetchSubscriptionData();
			checkPendingPayments();
		}
	}, []);

	const fetchSubscriptionData = async () => {
		try {
			const data = await subscriptionAPI.getUserSubscription();
			setSubscriptionData(data);
		} catch (error) {
			console.error('Error fetching subscription data:', error);
		}
	};

	const checkPendingPayments = async () => {
		try {
			const pendingData = await subscriptionAPI.checkPendingPayment();
			setHasPendingPayment(pendingData.hasPendingPayment);
			if (pendingData.hasPendingPayment) {
				setPendingPaymentData(pendingData);
				// Store in localStorage as well to persist across page refreshes
				localStorage.setItem(
					'pending_payment',
					JSON.stringify({
						hasPendingPayment: true,
						timestamp: new Date().getTime(),
						paymentId: pendingData.paymentId,
						orderId: pendingData.orderId,
					})
				);
			}
		} catch (error) {
			console.error('Error checking pending payments:', error);
		}
	};

	const handleUpgrade = async () => {
		try {
			if (!isLoggedIn) {
				navigate('/login', { state: { from: '/pricing' } });
				return;
			}

			// Check for pending payments first
			if (hasPendingPayment) {
				// Redirect to pending payment page
				navigate('/payment/pending');
				return;
			}

			setIsLoading(true);
			const response = await subscriptionAPI.createSubscription();

			// Buka halaman pembayaran Midtrans
			if (response.redirectUrl) {
				// Store pending payment info with user ID for verification
				const userString = localStorage.getItem('user');
				const user = userString ? JSON.parse(userString) : null;
				const userId = user?.id;

				localStorage.setItem(
					'pending_payment',
					JSON.stringify({
						hasPendingPayment: true,
						timestamp: new Date().getTime(),
						paymentId: response.payment.id,
						orderId: response.payment.order_id,
						userId: userId, // Associate with current user
					})
				);

				// Also store the redirect URL in sessionStorage for retrieval if needed
				sessionStorage.setItem(`redirect_${response.payment.order_id}`, response.redirectUrl);

				// Redirect to payment page
				window.location.href = response.redirectUrl;
			} else {
				// If no redirect URL was provided
				toast({
					title: 'Pembuatan Pembayaran Gagal',
					description: 'Terjadi kesalahan saat membuat pembayaran. Silakan coba lagi nanti.',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error creating subscription:', error);
			toast({
				title: 'Terjadi Kesalahan',
				description: 'Gagal memulai proses upgrade. Silakan coba lagi nanti.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const continuePendingPayment = () => {
		navigate('/payment/pending');
	};

	const isPro = subscriptionData?.subscription?.plan_type === 'pro';

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<div className="container flex flex-col items-center justify-center flex-1 py-12">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
						Harga Sederhana untuk Semua Kebutuhan
					</h1>
					<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
						Pilih paket yang sesuai dengan kebutuhan Anda. Upgrade kapan saja.
					</p>
				</div>

				<Tabs defaultValue="monthly" className="mt-12 w-full max-w-4xl">
					<TabsList className="mx-auto">
						<TabsTrigger value="monthly">Bulanan</TabsTrigger>
						<TabsTrigger value="yearly" disabled>
							Tahunan (Segera Hadir)
						</TabsTrigger>
					</TabsList>
					<TabsContent value="monthly" className="mt-8">
						<div className="grid gap-8 md:grid-cols-2">
							{/* Free Plan */}
							<Card className="flex flex-col border-gray-200">
								<CardHeader>
									<CardTitle className="text-2xl">Gratis</CardTitle>
									<CardDescription>Untuk pengguna personal dan pemula</CardDescription>
								</CardHeader>
								<CardContent className="flex-1">
									<div className="mt-2 flex items-baseline gap-x-2">
										<span className="text-3xl font-bold tracking-tight">Rp 0</span>
										<span className="text-gray-500 dark:text-gray-400">/bulan</span>
									</div>
									<ul className="mt-8 space-y-3">
										{features.map((feature) => (
											<li key={feature.name} className="flex items-center">
												{feature.includedInFree ? (
													<Check className="mr-3 h-5 w-5 text-green-500" />
												) : (
													<X className="mr-3 h-5 w-5 text-gray-500" />
												)}
												<span className={!feature.includedInFree ? 'text-gray-500' : ''}>
													{feature.name}
													{feature.name === 'Kuota Tautan (per hari)' && ' (3 Tautan)'}
												</span>
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter>
									{isPro ? (
										<Button className="w-full" disabled>
											Paket Saat Ini
										</Button>
									) : (
										<Button className="w-full" variant="outline" disabled={!isLoggedIn}>
											Gunakan Gratis
										</Button>
									)}
								</CardFooter>
							</Card>

							{/* Pro Plan */}
							<Card className="flex flex-col border-primary/50">
								<CardHeader className="bg-primary/5">
									<div className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground w-fit">
										Popular
									</div>
									<CardTitle className="text-2xl">Pro</CardTitle>
									<CardDescription>Untuk pengguna yang serius dan bisnis</CardDescription>
								</CardHeader>
								<CardContent className="flex-1">
									<div className="mt-2 flex items-baseline gap-x-2">
										<span className="text-3xl font-bold tracking-tight">Rp 7.000</span>
										<span className="text-gray-500 dark:text-gray-400">/bulan</span>
									</div>
									<ul className="mt-8 space-y-3">
										{features.map((feature) => (
											<li key={feature.name} className="flex items-center">
												{feature.includedInPro ? (
													<Check className="mr-3 h-5 w-5 text-green-500" />
												) : (
													<X className="mr-3 h-5 w-5 text-gray-500" />
												)}
												<span>
													{feature.name}
													{feature.name === 'Kuota Tautan (per hari)' && ' (Tidak Terbatas)'}
												</span>
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter>
									{isPro ? (
										<Button className="w-full" disabled>
											Paket Saat Ini
										</Button>
									) : hasPendingPayment ? (
										<Button className="w-full" onClick={continuePendingPayment} variant="secondary">
											Lanjutkan Pembayaran
										</Button>
									) : (
										<Button className="w-full" onClick={handleUpgrade} disabled={isLoading}>
											{isLoading ? 'Memproses...' : 'Upgrade ke Pro'}
										</Button>
									)}
								</CardFooter>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				<div className="mt-16 text-center">
					<h3 className="text-lg font-semibold">Punya pertanyaan tentang paket kami?</h3>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Hubungi tim dukungan kami di{' '}
						<a href="mailto:support@linkrio.com" className="text-primary hover:underline">
							support@linkrio.com
						</a>
					</p>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Pricing;
