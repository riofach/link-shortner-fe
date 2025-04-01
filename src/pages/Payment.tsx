import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { subscriptionAPI } from '@/lib/api';

const Payment = () => {
	const { status } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState(null);

	useEffect(() => {
		// Verify if the user is authenticated
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		// Fetch the latest subscription data
		const fetchSubscription = async () => {
			try {
				setLoading(true);
				const data = await subscriptionAPI.getUserSubscription();
				setSubscription(data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching subscription:', error);
				setLoading(false);
			}
		};

		fetchSubscription();
	}, [navigate]);

	const renderContent = () => {
		if (loading) {
			return (
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
					<p className="mt-4 text-lg">Memuat informasi pembayaran...</p>
				</div>
			);
		}

		// Variabel dideklarasikan di luar switch statement untuk menghindari error
		const isPro = subscription?.subscription?.plan_type === 'pro';

		switch (status) {
			case 'success':
				return (
					<div className="flex flex-col items-center text-center">
						<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
							<Check className="h-8 w-8 text-green-600" />
						</div>
						<h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
						<p className="text-gray-600 mb-6 max-w-md">
							{isPro
								? 'Akun Anda telah berhasil diupgrade ke Pro! Sekarang Anda memiliki akses ke semua fitur premium.'
								: 'Pembayaran Anda telah kami terima. Mohon tunggu sementara kami memproses langganan Anda.'}
						</p>
						<div className="flex gap-4">
							<Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
						</div>
					</div>
				);

			case 'error':
				return (
					<div className="flex flex-col items-center text-center">
						<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
							<X className="h-8 w-8 text-red-600" />
						</div>
						<h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
						<p className="text-gray-600 mb-6 max-w-md">
							Terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi atau hubungi
							dukungan pelanggan kami jika masalah berlanjut.
						</p>
						<div className="flex gap-4">
							<Button variant="outline" onClick={() => navigate('/dashboard')}>
								Kembali ke Dashboard
							</Button>
							<Button onClick={() => navigate('/pricing')}>Coba Lagi</Button>
						</div>
					</div>
				);

			case 'pending':
				return (
					<div className="flex flex-col items-center text-center">
						<div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
							<Clock className="h-8 w-8 text-yellow-600" />
						</div>
						<h1 className="text-2xl font-bold mb-2">Pembayaran Tertunda</h1>
						<p className="text-gray-600 mb-6 max-w-md">
							Pembayaran Anda dalam status tertunda. Kami akan memperbarui status langganan Anda
							segera setelah pembayaran selesai.
						</p>
						<div className="flex gap-4">
							<Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
						</div>
					</div>
				);

			default:
				return (
					<div className="flex flex-col items-center text-center">
						<h1 className="text-2xl font-bold mb-2">Status Tidak Dikenal</h1>
						<p className="text-gray-600 mb-6">Terjadi kesalahan. Silakan kembali ke dashboard.</p>
						<Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div className="flex-grow flex items-center justify-center py-12 px-6">
				<div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
					{renderContent()}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Payment;
