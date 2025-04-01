import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscriptionAPI, authAPI } from '../lib/api';
import { fetchWithRetry } from '../utils/fetchWithRetry';

// Interface untuk status langganan
interface SubscriptionStatus {
	isPro: boolean;
	loading: boolean;
	error: boolean;
}

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [subscription, setSubscription] = useState<SubscriptionStatus>({
		isPro: false,
		loading: true,
		error: false,
	});
	const navigate = useNavigate();

	// Fungsi untuk mengambil status langganan dengan retry
	const getSubscriptionStatus = async () => {
		if (!isLoggedIn) return;

		setSubscription((prev) => ({ ...prev, loading: true, error: false }));

		// Coba ambil dari localStorage dulu jika tersedia dan masih valid
		const cachedData = localStorage.getItem('subscription_status');
		const cachedTime = localStorage.getItem('subscription_cache_time');
		const rawData = localStorage.getItem('subscription_raw_data');

		// Jika ada data cache dan masih valid (kurang dari 1 jam)
		if (cachedData && cachedTime) {
			try {
				const parsedData = JSON.parse(cachedData);
				const cacheTime = parseInt(cachedTime);
				const now = new Date().getTime();

				// Jika cache belum expired (1 jam)
				if (now - cacheTime < 60 * 60 * 1000) {
					setSubscription({
						isPro: parsedData.isPro,
						loading: false,
						error: false,
					});
					// Tetap refresh di background setelah menggunakan cache
					refreshSubscriptionInBackground();
					return;
				}
			} catch (e) {
				console.error('Error parsing cached subscription data', e);
				// Lanjut fetch baru jika parsing error
			}
		}

		// Fetch baru jika tidak ada cache atau sudah expired
		fetchSubscription();
	};

	// Fetch subscription dan simpan ke cache
	const fetchSubscription = async () => {
		try {
			const data = await fetchWithRetry(() => subscriptionAPI.getUserSubscription());
			const isPro = data?.subscription?.plan_type === 'pro';

			// Simpan ke state
			setSubscription({
				isPro,
				loading: false,
				error: false,
			});

			// Simpan ke localStorage dengan timestamp
			localStorage.setItem('subscription_status', JSON.stringify({ isPro }));
			localStorage.setItem('subscription_cache_time', new Date().getTime().toString());
			// Simpan data mentah untuk digunakan sebagai fallback
			localStorage.setItem('subscription_raw_data', JSON.stringify(data));
		} catch (error) {
			console.error('Error fetching subscription:', error);
			setSubscription((prev) => ({ ...prev, loading: false, error: true }));
		}
	};

	// Refresh di background tanpa mengganggu UX
	const refreshSubscriptionInBackground = () => {
		setTimeout(() => {
			fetchSubscription();
		}, 0);
	};

	// Periksa status login dan langganan saat komponen dimuat
	useEffect(() => {
		const token = localStorage.getItem('token');
		const isUserLoggedIn = !!token;
		setIsLoggedIn(isUserLoggedIn);

		if (isUserLoggedIn) {
			getSubscriptionStatus();
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		localStorage.removeItem('subscription_status');
		localStorage.removeItem('subscription_cache_time');
		setIsLoggedIn(false);
		setSubscription({
			isPro: false,
			loading: false,
			error: false,
		});
		navigate('/');
	};

	return (
		<nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12">
			<div className="max-w-7xl mx-auto flex justify-between items-center">
				<div className="flex items-center">
					<Link to="/" className="text-2xl font-bold text-primary flex items-center space-x-2">
						<span className="text-3xl">⚡</span>
						<span>LinkRio</span>
					</Link>
				</div>

				{/* Desktop Menu */}
				<div className="hidden md:flex items-center space-x-8">
					<Link to="/" className="text-gray-700 hover:text-primary transition-colors duration-200">
						Beranda
					</Link>
					<Link
						to="/features"
						className="text-gray-700 hover:text-primary transition-colors duration-200"
					>
						Fitur
					</Link>
					{/* Sembunyikan menu Harga jika pengguna sudah Pro */}
					{!isLoggedIn || (isLoggedIn && !subscription.isPro) ? (
						<Link
							to="/pricing"
							className="text-gray-700 hover:text-primary transition-colors duration-200"
						>
							Harga
						</Link>
					) : null}

					{isLoggedIn ? (
						<div className="flex items-center space-x-4">
							<Link to="/dashboard">
								<Button variant="outline">Dashboard</Button>
							</Link>
							<Button onClick={handleLogout} variant="ghost" size="icon">
								<LogOut className="h-5 w-5" />
							</Button>
						</div>
					) : (
						<div className="flex items-center space-x-4">
							<Link to="/login">
								<Button variant="outline">Masuk</Button>
							</Link>
							<Link to="/register">
								<Button>Daftar</Button>
							</Link>
						</div>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 focus:outline-none">
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<div className="md:hidden mt-4 py-4 px-6 bg-white animate-fade-in">
					<div className="flex flex-col space-y-4">
						<Link
							to="/"
							className="text-gray-700 hover:text-primary transition-colors duration-200 py-2"
							onClick={() => setIsOpen(false)}
						>
							Beranda
						</Link>
						<Link
							to="/features"
							className="text-gray-700 hover:text-primary transition-colors duration-200 py-2"
							onClick={() => setIsOpen(false)}
						>
							Fitur
						</Link>
						{/* Sembunyikan menu Harga jika pengguna sudah Pro */}
						{!isLoggedIn || (isLoggedIn && !subscription.isPro) ? (
							<Link
								to="/pricing"
								className="text-gray-700 hover:text-primary transition-colors duration-200 py-2"
								onClick={() => setIsOpen(false)}
							>
								Harga
							</Link>
						) : null}

						{isLoggedIn ? (
							<>
								<Link to="/dashboard" className="w-full" onClick={() => setIsOpen(false)}>
									<Button variant="outline" className="w-full">
										Dashboard
									</Button>
								</Link>
								<Button
									onClick={() => {
										handleLogout();
										setIsOpen(false);
									}}
									className="w-full"
								>
									Keluar
								</Button>
							</>
						) : (
							<>
								<Link to="/login" className="w-full" onClick={() => setIsOpen(false)}>
									<Button variant="outline" className="w-full">
										Masuk
									</Button>
								</Link>
								<Link to="/register" className="w-full" onClick={() => setIsOpen(false)}>
									<Button className="w-full">Daftar</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
