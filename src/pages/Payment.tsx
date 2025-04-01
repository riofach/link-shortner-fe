import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscriptionAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Payment() {
	const { status } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState(null);
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		// Check if user is logged in
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		fetchSubscription();

		// Clear pending payment data if status is success
		if (status === 'success') {
			localStorage.removeItem('pending_payment');
		}
	}, [status]);

	const fetchSubscription = async () => {
		try {
			setLoading(true);
			const data = await subscriptionAPI.getUserSubscription();
			setSubscription(data);
		} catch (error) {
			console.error('Error fetching subscription:', error);
		} finally {
			setLoading(false);
		}
	};

	const checkPaymentStatus = async () => {
		try {
			setChecking(true);
			// Call the backend to check the payment status
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
	};

	const renderContent = () => {
		// Use our status parameter to determine what to show
		let isPro;

		switch (status) {
			case 'success':
				isPro = subscription?.subscription?.plan_type === 'pro';

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
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
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

	const handleUpgrade = async () => {
		try {
			setChecking(true);
			localStorage.removeItem('pending_payment');
			const response = await subscriptionAPI.createSubscription();
			if (response.redirectUrl) {
				// Store pending payment info in localStorage
				localStorage.setItem(
					'pending_payment',
					JSON.stringify({
						hasPendingPayment: true,
						timestamp: new Date().getTime(),
					})
				);

				window.location.href = response.redirectUrl;
			}
		} catch (error) {
			console.error(error);
			toast.error('Failed to upgrade subscription. Please try again.');
		} finally {
			setChecking(false);
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
		</div>
	);
}
