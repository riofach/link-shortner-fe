import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscriptionAPI, PaymentStatus, PendingPaymentData, SubscriptionData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
	CheckCircle,
	XCircle,
	Clock,
	Loader2,
	RefreshCw,
	Calendar,
	CreditCard,
	AlertTriangle,
	ExternalLink,
	ArrowRightCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

interface PendingPaymentDetails {
	paymentId?: number;
	orderId?: string;
	createdAt?: string;
	amount?: string;
	redirectUrl?: string;
}

export default function Payment() {
	const { status } = useParams<{ status: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
	const [checking, setChecking] = useState(false);
	const [pendingDetails, setPendingDetails] = useState<PendingPaymentDetails | null>(null);
	const [timeElapsed, setTimeElapsed] = useState<string>('');
	const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

	// Fetch subscription data
	const fetchSubscription = useCallback(async () => {
		try {
			setLoading(true);
			const data = await subscriptionAPI.getUserSubscription();
			setSubscription(data);
			return data;
		} catch (error) {
			console.error('Error fetching subscription:', error);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	// Check whether the payment success status is legitimate
	const validatePaymentSuccess = useCallback(async () => {
		try {
			setLoading(true);
			// Get pending payment data from localStorage as a first check
			const pendingPaymentData = localStorage.getItem('pending_payment');
			let orderId = '';

			if (pendingPaymentData) {
				try {
					const data = JSON.parse(pendingPaymentData);
					orderId = data.orderId;
				} catch (e) {
					console.error('Error parsing pending payment data:', e);
				}
			}

			// If we have an order ID, directly verify it
			if (orderId) {
				try {
					const verificationResult = await subscriptionAPI.verifyPaymentStatus(orderId);

					if (verificationResult.status === PaymentStatus.SUCCESS) {
						// Clean up payment data
						clearPaymentData();
						// Fetch the latest subscription data
						await fetchSubscription();
						return true;
					} else if (verificationResult.status === PaymentStatus.PENDING) {
						// Payment is still pending, redirect to pending page
						console.warn(
							'Success callback triggered but payment is still pending - redirecting to pending page'
						);
						navigate('/payment/pending', { replace: true });
						return false;
					}
				} catch (verifyError) {
					console.error('Error verifying specific payment:', verifyError);
				}
			}

			// Fall back to the general pending payment check
			const { hasPendingPayment } = await subscriptionAPI.checkPendingPayment();

			if (hasPendingPayment) {
				console.warn(
					'Success callback triggered but payment is still pending - redirecting to pending page'
				);
				navigate('/payment/pending', { replace: true });
				return false;
			}

			// If no pending payment, payment is likely complete
			clearPaymentData();
			await fetchSubscription();
			return true;
		} catch (error) {
			console.error('Error validating payment success:', error);
			return false;
		} finally {
			setLoading(false);
		}
	}, [fetchSubscription, navigate]);

	// Clear all payment related data from storage
	const clearPaymentData = useCallback(() => {
		localStorage.removeItem('pending_payment');
		// Clear any redirect URLs in sessionStorage
		Object.keys(sessionStorage).forEach((key) => {
			if (key.startsWith('redirect_')) {
				sessionStorage.removeItem(key);
			}
		});
	}, []);

	// Update the time elapsed since payment creation
	const updateTimeElapsed = useCallback(() => {
		if (!pendingDetails?.createdAt) return;

		const created = new Date(pendingDetails.createdAt);
		const now = new Date();
		const diffMs = now.getTime() - created.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 60) {
			setTimeElapsed(`${diffMins} menit`);
		} else {
			const hours = Math.floor(diffMins / 60);
			const mins = diffMins % 60;
			setTimeElapsed(`${hours} jam ${mins} menit`);
		}
	}, [pendingDetails?.createdAt]);

	// Fetch pending payment details
	const fetchPendingPaymentDetails = useCallback(async () => {
		try {
			// Check backend API for pending payment details
			const response = await subscriptionAPI.checkPendingPayment();

			if (response.hasPendingPayment) {
				setPendingDetails({
					paymentId: response.paymentId,
					orderId: response.orderId,
					createdAt: response.createdAt,
					amount: '7.000', // Default amount
					redirectUrl: response.redirectUrl,
				});

				if (response.redirectUrl) {
					setRedirectUrl(response.redirectUrl);
				}

				updateTimeElapsed();
				return true;
			}

			// If no active pending payment in backend, check localStorage as fallback
			const pendingPayment = localStorage.getItem('pending_payment');
			if (pendingPayment) {
				try {
					const pendingData = JSON.parse(pendingPayment);

					// Verify payment belongs to current user
					const userString = localStorage.getItem('user');
					if (!userString) {
						clearInvalidPaymentState('No user data found');
						return false;
					}

					const user = JSON.parse(userString);
					const userId = user.id;

					if (!pendingData.userId || pendingData.userId !== userId) {
						clearInvalidPaymentState('Invalid user ID in pending payment');
						return false;
					}

					if (pendingData.hasPendingPayment) {
						// Check if payment might be expired (more than 1 hour)
						const timestamp = pendingData.timestamp;
						const now = new Date().getTime();
						const hourInMillis = 60 * 60 * 1000;

						if (now - timestamp >= hourInMillis) {
							clearInvalidPaymentState('Payment has expired');
							return false;
						}

						// Try to get the redirect URL from sessionStorage
						const storedRedirectUrl = pendingData.orderId
							? sessionStorage.getItem(`redirect_${pendingData.orderId}`)
							: null;

						setPendingDetails({
							paymentId: pendingData.paymentId,
							orderId: pendingData.orderId,
							createdAt: new Date(pendingData.timestamp).toISOString(),
							amount: '7.000', // Default amount
							redirectUrl: storedRedirectUrl || null,
						});

						if (storedRedirectUrl) {
							setRedirectUrl(storedRedirectUrl);
						} else if (pendingData.orderId) {
							// If no redirect URL is found, fetch it again
							getPaymentRedirectUrl(pendingData.orderId);
						}

						updateTimeElapsed();
						return true;
					}
				} catch (e) {
					console.error('Error parsing pending payment data:', e);
					clearInvalidPaymentState('Invalid payment data format');
					return false;
				}
			}

			// No pending payment found
			clearInvalidPaymentState('No pending payment found');
			return false;
		} catch (error) {
			console.error('Error fetching pending payment details:', error);
			toast.error('Gagal mengambil detail pembayaran');
			navigate('/dashboard');
			return false;
		}
	}, [updateTimeElapsed, navigate]);

	// Helper to clear invalid payment state and redirect
	const clearInvalidPaymentState = useCallback(
		(reason: string) => {
			console.log(`Clearing invalid payment state: ${reason}`);
			localStorage.removeItem('pending_payment');
			toast.info('Tidak ada pembayaran yang tertunda');
			navigate('/dashboard');
		},
		[navigate]
	);

	// Get payment redirect URL for a specific order
	const getPaymentRedirectUrl = useCallback(async (orderId: string) => {
		try {
			setChecking(true);
			const response = await subscriptionAPI.getPaymentUrl(orderId);
			if (response && response.redirectUrl) {
				setRedirectUrl(response.redirectUrl);
				// Store in session storage for future use
				sessionStorage.setItem(`redirect_${orderId}`, response.redirectUrl);
			} else {
				toast.error('Gagal mendapatkan link pembayaran. Silakan coba lagi nanti.');
			}
		} catch (error) {
			console.error('Error getting payment URL:', error);
			toast.error('Gagal mendapatkan link pembayaran');
		} finally {
			setChecking(false);
		}
	}, []);

	// Check current payment status
	const checkPaymentStatus = useCallback(async () => {
		try {
			setChecking(true);

			// If we have an order ID, directly verify it
			if (pendingDetails?.orderId) {
				try {
					const verificationResult = await subscriptionAPI.verifyPaymentStatus(
						pendingDetails.orderId
					);

					if (verificationResult.status === PaymentStatus.SUCCESS) {
						// Clean up payment data
						clearPaymentData();
						// Fetch the latest subscription data
						await fetchSubscription();
						toast.success('Payment completed successfully!');
						navigate('/dashboard');
						return;
					}
				} catch (verifyError) {
					console.error('Error verifying specific payment:', verifyError);
				}
			}

			// Fall back to general pending payment check
			const { hasPendingPayment } = await subscriptionAPI.checkPendingPayment();

			if (!hasPendingPayment) {
				// If no pending payment, refresh subscription data
				await fetchSubscription();
				toast.success('Payment completed successfully!');
				navigate('/dashboard');
			} else {
				toast.info('Your payment is still being processed. Please wait.');
			}
		} catch (error) {
			console.error('Error checking payment status:', error);
			toast.error('Failed to check payment status');
		} finally {
			setChecking(false);
		}
	}, [pendingDetails?.orderId, fetchSubscription, navigate, clearPaymentData]);

	// Continue to payment page
	const continueToPay = useCallback(() => {
		if (redirectUrl) {
			window.location.href = redirectUrl;
		} else if (pendingDetails?.orderId) {
			// If we don't have a redirect URL but have an order ID, try to get it
			getPaymentRedirectUrl(pendingDetails.orderId);
		} else {
			toast.error('Tidak dapat menemukan link pembayaran. Silakan coba buat transaksi baru.');
		}
	}, [redirectUrl, pendingDetails?.orderId, getPaymentRedirectUrl]);

	// Create a new subscription
	const handleUpgrade = useCallback(async () => {
		try {
			setChecking(true);
			localStorage.removeItem('pending_payment');
			const response = await subscriptionAPI.createSubscription();

			if (response.redirectUrl) {
				// Get the current user ID to associate with the payment
				const userString = localStorage.getItem('user');
				const user = userString ? JSON.parse(userString) : null;
				const userId = user?.id;

				// Store pending payment info in localStorage
				localStorage.setItem(
					'pending_payment',
					JSON.stringify({
						hasPendingPayment: true,
						timestamp: new Date().getTime(),
						paymentId: response.payment.id,
						orderId: response.payment.order_id,
						userId, // Associate with current user
					})
				);

				// Also store the redirect URL in sessionStorage for retrieval if needed
				sessionStorage.setItem(`redirect_${response.payment.order_id}`, response.redirectUrl);

				window.location.href = response.redirectUrl;
			} else {
				toast.error('Failed to create payment. Please try again.');
			}
		} catch (error) {
			console.error(error);
			toast.error('Failed to upgrade subscription. Please try again.');
		} finally {
			setChecking(false);
		}
	}, []);

	// Initial setup on component mount
	useEffect(() => {
		// Check if user is logged in
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		// Initial data fetch
		fetchSubscription();

		// Handle different payment statuses
		if (status === 'success') {
			validatePaymentSuccess();
		} else if (status === 'pending') {
			fetchPendingPaymentDetails();
		}

		// Start a timer to update the elapsed time for pending payments
		const intervalId = setInterval(() => {
			if (status === 'pending' && pendingDetails?.createdAt) {
				updateTimeElapsed();
			}
		}, 10000); // Update every 10 seconds

		return () => clearInterval(intervalId);
	}, [
		status,
		navigate,
		fetchSubscription,
		validatePaymentSuccess,
		fetchPendingPaymentDetails,
		updateTimeElapsed,
		pendingDetails?.createdAt,
	]);

	// Render different content based on payment status
	const renderContent = () => {
		// Use the status parameter to determine what to show
		const isPro = subscription?.subscription?.plan_type === 'pro';

		switch (status) {
			case 'success':
				return (
					<div className="text-center">
						<CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
						<h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
						<p className="text-gray-600 mb-6">
							{isPro
								? 'Your account has been upgraded to Pro. Enjoy all premium features!'
								: "Your payment was successful, but your account hasn't been upgraded yet. This could take a few minutes."}
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
								Go to Dashboard
							</Button>
							{!isPro && (
								<Button
									onClick={checkPaymentStatus}
									variant="outline"
									className="w-full sm:w-auto"
									disabled={checking}
								>
									{checking ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Checking...
										</>
									) : (
										<>
											<RefreshCw className="mr-2 h-4 w-4" />
											Check Status
										</>
									)}
								</Button>
							)}
						</div>
					</div>
				);

			case 'error':
				return (
					<div className="text-center">
						<XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
						<h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
						<p className="text-gray-600 mb-6">
							We couldn't process your payment. Please try again or contact support if the problem
							persists.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
								Go to Dashboard
							</Button>
							<Button
								onClick={handleUpgrade}
								variant="outline"
								className="w-full sm:w-auto"
								disabled={checking}
							>
								{checking ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									<>Try Again</>
								)}
							</Button>
						</div>
					</div>
				);

			case 'pending':
				return (
					<div className="text-center">
						<Clock className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
						<h2 className="text-2xl font-bold mb-2">Payment Pending</h2>
						<p className="text-gray-600 mb-6">
							Your payment is being processed. This may take a few minutes. We'll update your
							account once the payment is confirmed.
						</p>

						{pendingDetails && (
							<div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
								<h3 className="font-medium text-yellow-800 mb-2">Transaction Details</h3>
								<div className="space-y-2 text-sm">
									{pendingDetails.orderId && (
										<div className="flex items-start">
											<CreditCard className="h-4 w-4 mr-2 mt-0.5 text-yellow-600" />
											<div>
												<span className="block text-yellow-700">Order ID:</span>
												<span className="text-yellow-900">{pendingDetails.orderId}</span>
											</div>
										</div>
									)}
									{pendingDetails.createdAt && (
										<div className="flex items-start">
											<Calendar className="h-4 w-4 mr-2 mt-0.5 text-yellow-600" />
											<div>
												<span className="block text-yellow-700">Created:</span>
												<span className="text-yellow-900">
													{new Date(pendingDetails.createdAt).toLocaleString()}
													{timeElapsed && ` (${timeElapsed} yang lalu)`}
												</span>
											</div>
										</div>
									)}
									{pendingDetails.amount && (
										<div className="flex items-start">
											<AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-yellow-600" />
											<div>
												<span className="block text-yellow-700">
													Pembayaran akan kedaluwarsa setelah 1 jam
												</span>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						<div className="flex flex-col gap-4 mb-6">
							<Button
								onClick={continueToPay}
								className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
								disabled={checking || !pendingDetails?.orderId}
							>
								{checking ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Memproses...
									</>
								) : (
									<>
										<ArrowRightCircle className="mr-2 h-4 w-4" />
										Lanjutkan ke Halaman Pembayaran
									</>
								)}
							</Button>
						</div>

						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button
								onClick={() => navigate('/dashboard')}
								variant="outline"
								className="w-full sm:w-auto"
							>
								Go to Dashboard
							</Button>
							<Button
								onClick={checkPaymentStatus}
								variant="outline"
								className="w-full sm:w-auto"
								disabled={checking}
							>
								{checking ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Checking...
									</>
								) : (
									<>
										<RefreshCw className="mr-2 h-4 w-4" />
										Check Status
									</>
								)}
							</Button>
						</div>
					</div>
				);

			default:
				return (
					<div className="text-center">
						<h2 className="text-2xl font-bold mb-2">Unknown Payment Status</h2>
						<p className="text-gray-600 mb-6">
							We couldn't determine the status of your payment. Please check your dashboard for
							details.
						</p>
						<Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
							Go to Dashboard
						</Button>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Navbar />
			<main className="flex-grow flex items-center justify-center py-12 px-6">
				<div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
							<p className="text-gray-600">Loading your subscription information...</p>
						</div>
					) : (
						renderContent()
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
