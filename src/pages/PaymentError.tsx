import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentError: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<div className="container flex flex-col items-center justify-center flex-1 py-12">
				<Card className="mx-auto max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
							<XCircle className="h-10 w-10 text-red-600" />
						</div>
						<CardTitle className="text-2xl">Pembayaran Gagal</CardTitle>
						<CardDescription>Terjadi masalah dengan pembayaran Anda</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<div className="mt-2 space-y-4">
							<p>
								Maaf, kami tidak dapat memproses pembayaran Anda. Ini mungkin disebabkan oleh
								beberapa alasan:
							</p>
							<ul className="list-disc text-left pl-8 space-y-1">
								<li>Kesalahan pada layanan pembayaran</li>
								<li>Masalah koneksi internet</li>
								<li>Pembayaran dibatalkan</li>
								<li>Saldo tidak mencukupi</li>
							</ul>
							<p className="text-sm text-gray-500 mt-4">
								No. Referensi:{' '}
								{new URLSearchParams(window.location.search).get('order_id') || 'Tidak ada'}
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex justify-center gap-4">
						<Button variant="outline" onClick={() => navigate('/dashboard')}>
							Kembali ke Dashboard
						</Button>
						<Button onClick={() => navigate('/pricing')}>Coba Lagi</Button>
					</CardFooter>
				</Card>

				<div className="mt-8 text-center max-w-md">
					<h3 className="text-lg font-semibold">Butuh bantuan?</h3>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Jika Anda mengalami masalah dengan pembayaran, silakan hubungi tim dukungan kami di{' '}
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

export default PaymentError;
