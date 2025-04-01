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

// Cek di level file (global) apakah user sudah Pro
const checkUserProStatus = (): boolean => {
	try {
		// 1. Cek data dari localStorage
		const cached = localStorage.getItem('subscription_status');
		if (cached) {
			const { isPro } = JSON.parse(cached);
			return !!isPro; // Pastikan boolean
		}

		// 2. Jika tidak ada, cek dari raw data
		const rawData = localStorage.getItem('subscription_raw_data');
		if (rawData) {
			try {
				const data = JSON.parse(rawData);
				if (data?.subscription?.plan_type === 'pro') {
					return true;
				}
			} catch (e) {
				console.error('Error parsing raw data:', e);
			}
		}
	} catch (e) {
		console.error('Error checking Pro status:', e);
	}
	return false;
};

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	// Preload dari global checker
	const initialIsPro = checkUserProStatus();
	const [subscription, setSubscription] = useState<SubscriptionStatus>({
		isPro: initialIsPro,
		loading: true,
		error: false,
	});
	// State terpisah untuk visibility menu pricing
	const [hideMenu, setHideMenu] = useState(initialIsPro);
	const navigate = useNavigate();

	// Fetch subscription dan simpan ke cache
	const fetchSubscription = async (force = false) => {
		try {
			console.log('Fetching subscription in Navbar with force =', force);

			// Jika force = false, cek cache dulu
			if (!force) {
				// Coba ambil dari localStorage dulu jika tersedia dan masih valid
				const cachedData = localStorage.getItem('subscription_status');
				const cachedTime = localStorage.getItem('subscription_cache_time');

				// Jika ada data cache dan masih valid (kurang dari 15 menit)
				if (cachedData && cachedTime) {
					try {
						const parsedData = JSON.parse(cachedData);
						const cacheTime = parseInt(cachedTime);
						const now = new Date().getTime();

						// Jika cache belum expired (15 menit)
						if (now - cacheTime < 15 * 60 * 1000) {
							const isPro = !!parsedData.isPro;
							setSubscription({
								isPro,
								loading: false,
								error: false,
							});
							setHideMenu(isPro);
							console.log('Using cached data, isPro =', isPro);
							return;
						}
					} catch (e) {
						console.error('Error parsing cached subscription data', e);
					}
				}
			}

			// Cache tidak valid atau force = true, fetch dari server
			const data = await fetchWithRetry(() => subscriptionAPI.getUserSubscription());
			console.log('Fresh subscription data in Navbar:', data);

			// Check jika ada data yang valid
			if (!data) {
				console.error('No subscription data returned');
				return;
			}

			// Check struktur data dan extract plan_type
			const planType = data?.subscription?.plan_type;
			const isPro = planType === 'pro';
			console.log(`User plan: ${planType}, isPro: ${isPro}`);

			// Update semua status isPro
			setSubscription({
				isPro,
				loading: false,
				error: false,
			});
			setHideMenu(isPro);

			// Simpan ke localStorage dengan timestamp
			localStorage.setItem('subscription_status', JSON.stringify({ isPro }));
			localStorage.setItem('subscription_cache_time', new Date().getTime().toString());
			localStorage.setItem('subscription_raw_data', JSON.stringify(data));

			console.log('Updated subscription status in localStorage');
		} catch (error) {
			console.error('Error fetching subscription:', error);
			setSubscription((prev) => ({ ...prev, loading: false, error: true }));
		}
	};

	// Periksa status login dan langganan saat komponen dimuat
	useEffect(() => {
		const token = localStorage.getItem('token');
		const isUserLoggedIn = !!token;
		setIsLoggedIn(isUserLoggedIn);

		if (isUserLoggedIn) {
			// Selalu force refresh saat pertama kali mount
			fetchSubscription(true);
		}
	}, []);

	// Debug log
	console.log('Navbar render - hideMenu:', hideMenu);
	console.log('Navbar render - subscription.isPro:', subscription.isPro);
	console.log('Navbar render - isLoggedIn:', isLoggedIn);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		localStorage.removeItem('subscription_status');
		localStorage.removeItem('subscription_cache_time');
		localStorage.removeItem('subscription_raw_data');
		setIsLoggedIn(false);
		setSubscription({
			isPro: false,
			loading: false,
			error: false,
		});
		setHideMenu(false);
		navigate('/');
	};

	// Sederhana: logika menampilkan menu pricing
	const shouldShowPricingMenu = !isLoggedIn || !hideMenu;

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
					{shouldShowPricingMenu && (
						<Link
							to="/pricing"
							className="text-gray-700 hover:text-primary transition-colors duration-200"
						>
							Harga
						</Link>
					)}

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
						{shouldShowPricingMenu && (
							<Link
								to="/pricing"
								className="text-gray-700 hover:text-primary transition-colors duration-200 py-2"
								onClick={() => setIsOpen(false)}
							>
								Harga
							</Link>
						)}

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
