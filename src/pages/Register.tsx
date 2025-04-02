import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authAPI } from '@/lib/api';

const formSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address' }),
	password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
	name: z.string().min(1, { message: 'Name is required' }),
	terms: z.boolean().refine((val) => val === true, {
		message: 'You must accept the terms and conditions',
	}),
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			name: '',
			terms: false,
		},
	});

	const onSubmit = async (values: FormValues) => {
		setIsLoading(true);

		try {
			// Clear any existing payment data from localStorage/sessionStorage to avoid issues with new accounts
			localStorage.removeItem('pending_payment');
			localStorage.removeItem('subscription_status');
			localStorage.removeItem('subscription_cache_time');
			localStorage.removeItem('subscription_raw_data');

			// Clear any redirect URLs in sessionStorage
			Object.keys(sessionStorage).forEach((key) => {
				if (key.startsWith('redirect_')) {
					sessionStorage.removeItem(key);
				}
			});

			const response = await authAPI.register(values.email, values.password, values.name);

			// Simpan token dan data user
			localStorage.setItem('token', response.token);
			localStorage.setItem('user', JSON.stringify(response.user));

			setIsLoading(false);
			toast.success('Pendaftaran berhasil');
			navigate('/dashboard');
		} catch (error: unknown) {
			setIsLoading(false);

			if (
				error &&
				typeof error === 'object' &&
				'response' in error &&
				error.response &&
				typeof error.response === 'object' &&
				'data' in error.response &&
				error.response.data &&
				typeof error.response.data === 'object' &&
				'error' in error.response.data
			) {
				toast.error(String(error.response.data.error));
			} else {
				toast.error('Gagal mendaftar. Silakan coba lagi.');
			}
		}
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<Navbar />

			<main className="flex-grow flex items-center justify-center py-12 px-6">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
						<p className="mt-2 text-gray-600">Join LinkStride and start shortening links today</p>
					</div>

					<div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<div className="relative">
													<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
													<Input placeholder="John Doe" className="pl-10" {...field} />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<div className="relative">
													<Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
													<Input
														placeholder="you@example.com"
														type="email"
														autoComplete="email"
														className="pl-10"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
													<Input
														placeholder="••••••••"
														type={showPassword ? 'text' : 'password'}
														autoComplete="new-password"
														className="pl-10 pr-10"
														{...field}
													/>
													<button
														type="button"
														className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className="h-5 w-5" />
														) : (
															<Eye className="h-5 w-5" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="terms"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Terms and Conditions</FormLabel>
											<FormControl>
												<Checkbox checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? 'Creating Account...' : 'Create Account'}
								</Button>
							</form>
						</Form>

						<div className="mt-6 text-center text-sm">
							<p className="text-gray-600">
								Already have an account?{' '}
								<Link to="/login" className="text-primary font-medium hover:underline">
									Log in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Register;
