import React, { useEffect } from 'react';
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
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess: React.FC = () => {
	const navigate = useNavigate();

	useEffect(() => {
		// Bisa digunakan untuk fetch status terbaru jika diperlukan
	}, []);

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<div className="container flex flex-col items-center justify-center flex-1 py-12">
				<Card className="mx-auto max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
							<CheckCircle className="h-10 w-10 text-green-600" />
						</div>
						<CardTitle className="text-2xl">Pembayaran Berhasil!</CardTitle>
						<CardDescription>Terima kasih atas pembayaran Anda</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<div className="mt-2 space-y-4">
							<p>
								Akun Anda telah berhasil ditingkatkan ke paket Pro. Nikmati semua fitur premium
								seperti kode kustom, analitik, dan pembuatan tautan tanpa batas.
							</p>
							<p className="font-medium">
								No. Referensi Pembayaran:{' '}
								{new URLSearchParams(window.location.search).get('order_id') || '-'}
							</p>
							<p className="text-sm text-gray-500">
								Email konfirmasi telah dikirim ke alamat email terdaftar Anda.
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex justify-center gap-4">
						<Button variant="outline" onClick={() => navigate('/dashboard')}>
							Ke Dashboard
						</Button>
						<Button onClick={() => navigate('/pricing')}>Lihat Paket Saya</Button>
					</CardFooter>
				</Card>
			</div>
			<Footer />
		</div>
	);
};

export default PaymentSuccess;
