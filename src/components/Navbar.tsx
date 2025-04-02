import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscriptionAPI, SubscriptionData } from '@/lib/api';
import { fetchWithRetry } from '@/utils/fetchWithRetry';

// Interface for subscription status
interface SubscriptionStatus {
	isPro: boolean;
	loading: boolean;
	error: boolean;
}

// Global utility functions for subscription status
const CACHE_KEYS = {
	SUBSCRIPTION_STATUS: 'subscription_status',
	SUBSCRIPTION_CACHE_TIME: 'subscription_cache_time',
	SUBSCRIPTION_RAW_DATA: 'subscription_raw_data',
	PENDING_PAYMENT: 'pending_payment',
};

// Check if user has Pro status using cached data
const checkUserProStatus = (): boolean => {
	try {
		// 1. Check from localStorage
		const cached = localStorage.getItem(CACHE_KEYS.SUBSCRIPTION_STATUS);
		if (cached) {
			const { isPro } = JSON.parse(cached);
			return !!isPro; // Ensure boolean
		}

		// 2. Try raw data if status not found
		const rawData = localStorage.getItem(CACHE_KEYS.SUBSCRIPTION_RAW_DATA);
		if (rawData) {
			try {
				const data = JSON.parse(rawData) as SubscriptionData;
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

// Check for pending payments
const checkPendingPayment = (): boolean => {
	try {
		// Get the current user
		const userString = localStorage.getItem('user');
		if (!userString) return false;

		const user = JSON.parse(userString);
		const userId = user.id;
		if (!userId) return false;

		const pendingPayment = localStorage.getItem(CACHE_KEYS.PENDING_PAYMENT);
		if (pendingPayment) {
			const data = JSON.parse(pendingPayment);

			// Verify the pending payment belongs to the current user
			if (!data.userId || data.userId !== userId) {
				// Clear invalid pending payment data
				localStorage.removeItem(CACHE_KEYS.PENDING_PAYMENT);
				return false;
			}

			if (data.hasPendingPayment) {
				// Check if payment has expired (more than 1 hour)
				const timestamp = data.timestamp;
				const now = new Date().getTime();
				const hourInMillis = 60 * 60 * 1000;

				if (now - timestamp < hourInMillis) {
					return true;
				} else {
					// Clear expired payment data
					localStorage.removeItem(CACHE_KEYS.PENDING_PAYMENT);
				}
			}
		}
	} catch (e) {
		console.error('Error checking pending payment:', e);
		// Clear potentially corrupted data
		localStorage.removeItem(CACHE_KEYS.PENDING_PAYMENT);
	}
	return false;
};

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	// Preload using global checker
	const initialIsPro = checkUserProStatus();
	const initialHasPending = checkPendingPayment();
	const [subscription, setSubscription] = useState<SubscriptionStatus>({
		isPro: initialIsPro,
		loading: true,
		error: false,
	});
	// Separate state for pricing menu visibility
	const [hideMenu, setHideMenu] = useState(initialIsPro || initialHasPending);
	const [hasPendingPayment, setHasPendingPayment] = useState(initialHasPending);
	const navigate = useNavigate();
	const location = useLocation();

	// Clear all payment related data
	const clearPaymentData = useCallback(() => {
		localStorage.removeItem(CACHE_KEYS.PENDING_PAYMENT);
		// Clear any redirect URLs in sessionStorage
		Object.keys(sessionStorage).forEach((key) => {
			if (key.startsWith('redirect_')) {
				sessionStorage.removeItem(key);
			}
		});
	}, []);

	// Fetch subscription data with caching
	const fetchSubscription = useCallback(
		async (forceRefresh = false) => {
			try {
				// If coming from payment page, force refresh
				const fromPayment = location.pathname.includes('/payment/');
				const shouldForceRefresh = forceRefresh || fromPayment;

				// Check cache if not forcing refresh
				if (!shouldForceRefresh) {
					const cachedStatus = localStorage.getItem(CACHE_KEYS.SUBSCRIPTION_STATUS);
					const cacheTimeStr = localStorage.getItem(CACHE_KEYS.SUBSCRIPTION_CACHE_TIME);

					if (cachedStatus && cacheTimeStr) {
						try {
							const parsedData = JSON.parse(cachedStatus);
							const cacheTime = parseInt(cacheTimeStr);
							const now = new Date().getTime();

							// Cache valid for 1 hour
							if (now - cacheTime < 60 * 60 * 1000) {
								const isPro = !!parsedData.isPro;
								setSubscription({
									isPro,
									loading: false,
									error: false,
								});
								// Also check pending payment status
								const hasPending = checkPendingPayment();
								setHasPendingPayment(hasPending);
								setHideMenu(isPro || hasPending);
								return;
							}
						} catch (e) {
							console.error('Error parsing cached subscription data', e);
						}
					}
				}

				// Need fresh data, fetch from server
				const data = await fetchWithRetry(() => subscriptionAPI.getUserSubscription());

				// Check structure and extract plan_type
				const planType = data?.subscription?.plan_type;
				const isPro = planType === 'pro';

				// Also check for pending payments
				const hasPending = checkPendingPayment();
				setHasPendingPayment(hasPending);

				// Update all subscription status
				setSubscription({
					isPro,
					loading: false,
					error: false,
				});

				// Hide menu if either Pro or has pending payment
				setHideMenu(isPro || hasPending);

				// Cache status for faster future access
				localStorage.setItem(CACHE_KEYS.SUBSCRIPTION_STATUS, JSON.stringify({ isPro }));
				localStorage.setItem(CACHE_KEYS.SUBSCRIPTION_CACHE_TIME, new Date().getTime().toString());
				localStorage.setItem(CACHE_KEYS.SUBSCRIPTION_RAW_DATA, JSON.stringify(data));

				// If user is pro, clear any pending payment data
				if (isPro) {
					clearPaymentData();
				}
				// If not pro, check for pending payment via API
				else {
					try {
						const pendingData = await subscriptionAPI.checkPendingPayment();
						if (pendingData.hasPendingPayment) {
							setHasPendingPayment(true);
							setHideMenu(true);
						}
					} catch (e) {
						console.error('Error checking pending payment:', e);
					}
				}
			} catch (error) {
				console.error('Error fetching subscription in Navbar:', error);
				setSubscription((prev) => ({ ...prev, loading: false, error: true }));
			}
		},
		[location.pathname, clearPaymentData]
	);

	// Logout handler
	const handleLogout = useCallback(() => {
		// Clear all auth and subscription data
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		localStorage.removeItem(CACHE_KEYS.SUBSCRIPTION_STATUS);
		localStorage.removeItem(CACHE_KEYS.SUBSCRIPTION_CACHE_TIME);
		localStorage.removeItem(CACHE_KEYS.SUBSCRIPTION_RAW_DATA);
		clearPaymentData();

		// Reset state
		setIsLoggedIn(false);
		setSubscription({
			isPro: false,
			loading: false,
			error: false,
		});
		setHideMenu(false);
		setHasPendingPayment(false);

		// Redirect to home
		navigate('/');
	}, [navigate, clearPaymentData]);

	// Check login status and fetch subscription on mount
	useEffect(() => {
		const token = localStorage.getItem('token');
		const isUserLoggedIn = !!token;
		setIsLoggedIn(isUserLoggedIn);

		if (isUserLoggedIn) {
			// Force refresh on mount
			fetchSubscription(true);
		}
	}, [fetchSubscription]);

	// Computed property for showing pricing menu
	const shouldShowPricingMenu = useMemo(() => {
		return !isLoggedIn || (!hideMenu && !hasPendingPayment);
	}, [isLoggedIn, hideMenu, hasPendingPayment]);

	return (
		<nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12">
			<div className="max-w-7xl mx-auto flex justify-between items-center">
				<div className="flex items-center">
					<Link to="/" className="text-2xl font-bold text-primary flex items-center space-x-2">
						<img src="/images/logo.png" alt="LinkRio Logo" className="h-12 w-auto" />
						{/* <span>LinkRio</span> */}
					</Link>
				</div>

				{/* Desktop Menu */}
				<div className="hidden md:flex items-center space-x-8">
					<Link to="/" className="text-gray-700 hover:text-primary transition-colors duration-200">
						Home
					</Link>
					<Link
						to="/features"
						className="text-gray-700 hover:text-primary transition-colors duration-200"
					>
						Features
					</Link>
					{/* Hide pricing menu if user is Pro or has pending payment */}
					{shouldShowPricingMenu && (
						<Link
							to="/pricing"
							className="text-gray-700 hover:text-primary transition-colors duration-200"
						>
							Pricing
						</Link>
					)}

					{isLoggedIn ? (
						<div className="flex items-center space-x-4">
							<Link to="/dashboard">
								<Button variant="outline">Dashboard</Button>
							</Link>
							<Button onClick={handleLogout} variant="ghost" size="icon" title="Logout">
								<LogOut className="h-5 w-5" />
							</Button>
						</div>
					) : (
						<div className="flex items-center space-x-4">
							<Link to="/login">
								<Button variant="outline">Login</Button>
							</Link>
							<Link to="/register">
								<Button>Sign Up</Button>
							</Link>
						</div>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="text-gray-700 focus:outline-none"
						aria-label={isOpen ? 'Close menu' : 'Open menu'}
					>
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-4`}>
				<div className="flex flex-col space-y-4">
					<Link
						to="/"
						className="text-gray-700 hover:text-primary transition-colors duration-200"
						onClick={() => setIsOpen(false)}
					>
						Home
					</Link>
					<Link
						to="/features"
						className="text-gray-700 hover:text-primary transition-colors duration-200"
						onClick={() => setIsOpen(false)}
					>
						Features
					</Link>
					{/* Sembunyikan menu Harga jika pengguna sudah Pro atau memiliki pembayaran tertunda */}
					{shouldShowPricingMenu && (
						<Link
							to="/pricing"
							className="text-gray-700 hover:text-primary transition-colors duration-200"
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
		</nav>
	);
};

export default Navbar;
