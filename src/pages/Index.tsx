import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UrlShortener from '@/components/UrlShortener';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { BarChart3, Shield, Zap, LineChart, Layers, Globe, Users } from 'lucide-react';
import { subscriptionAPI } from '../lib/api';

const Index = () => {
	const navigate = useNavigate();
	const [userCount, setUserCount] = useState(0);
	const [activeUsers, setActiveUsers] = useState(0);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			// Check if we can redirect to dashboard
			const lastPage = localStorage.getItem('last_visited_page');
			if (lastPage && lastPage.includes('dashboard')) {
				navigate('/dashboard');
			}
		}

		// Initialize user count with some randomization for social proof
		const baseCount = 5000;
		const randomVariation = Math.floor(Math.random() * 400);
		setUserCount(baseCount + randomVariation);

		// Set active users
		const currentTime = new Date().getTime();
		const activeUserCount = Math.floor(Math.random() * 200) + 100;
		setActiveUsers(activeUserCount);

		// Store the current timestamp for recently active metric
		localStorage.setItem('last_active_time', currentTime.toString());

		// Check how many links have been created total across sessions
		try {
			const cachedData = localStorage.getItem('subscription_raw_data');
			if (cachedData) {
				const data = JSON.parse(cachedData);
				if (data?.stats?.totalLinks) {
					// Use this to incrementally show more realistic growth
					const totalLinks = parseInt(data.stats.totalLinks);
					const linkIncrement = Math.min(totalLinks, 20);
					setUserCount((prev) => prev + linkIncrement);
				}
			}
		} catch (e) {
			console.error('Error processing cached data for user metrics', e);
		}
	}, []);

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<Navbar />

			<main className="flex-grow">
				{/* Hero Section */}
				<section className="bg-gradient-to-b from-secondary to-white py-20 px-6">
					<div className="max-w-6xl mx-auto text-center">
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
							Shorten URLs, <span className="text-primary">Amplify Results</span>
						</h1>
						<p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
							Create short, memorable links in seconds. Track performance with detailed analytics
							and reach your audience more effectively.
						</p>

						<div className="bg-white p-6 md:p-10 rounded-xl shadow-lg">
							<UrlShortener />
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-20 px-6">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Powerful features to supercharge your links
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								Everything you need to create, manage, and analyze your shortened links in one
								place.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grid-animation">
							<FeatureCard
								icon={<Zap size={24} />}
								title="Lightning Fast"
								description="Create short links instantly with our streamlined interface. No waiting, just results."
							/>
							<FeatureCard
								icon={<Shield size={24} />}
								title="Secure & Reliable"
								description="Bank-level security keeps your links and data safe. 99.9% uptime guarantee."
							/>
							<FeatureCard
								icon={<LineChart size={24} />}
								title="Detailed Analytics"
								description="Track clicks, visitor locations, devices, and referrers with real-time data."
							/>
							<FeatureCard
								icon={<Layers size={24} />}
								title="Custom URLs"
								description="Create branded, memorable links with your own custom aliases and domains."
							/>
							<FeatureCard
								icon={<BarChart3 size={24} />}
								title="Performance Dashboard"
								description="Monitor all your links in one place with our intuitive, data-rich dashboard."
							/>
							<FeatureCard
								icon={<Globe size={24} />}
								title="Global Reach"
								description="Optimize content delivery and track audience engagement worldwide."
							/>
						</div>
					</div>
				</section>

				{/* Dynamic stats section */}
				<section className="py-20 px-6 bg-gray-50">
					<div className="max-w-6xl mx-auto">
						<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
							Fitur Unggulan Kami
						</h2>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
								<div className="flex items-center justify-center mb-2">
									<Users className="w-6 h-6 mr-2" />
									<span className="font-bold">{userCount.toLocaleString()}+</span>
								</div>
								<p className="text-sm">Pengguna Terdaftar</p>
							</div>
							<div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
								<div className="flex items-center justify-center mb-2">
									<Zap className="w-6 h-6 mr-2" />
									<span className="font-bold">{activeUsers}+</span>
								</div>
								<p className="text-sm">Pengguna Aktif Saat Ini</p>
							</div>
							<div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
								<div className="flex items-center justify-center mb-2">
									<BarChart3 className="w-6 h-6 mr-2" />
									<span className="font-bold">100M+</span>
								</div>
								<p className="text-sm">Total Link Diklik</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="bg-primary py-20 px-6 text-white">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">
							Ready to take control of your links?
						</h2>
						<p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
							Join thousands of businesses and individuals who trust LinkStride for their link
							management needs.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Link to="/register">
								<Button size="lg" variant="secondary" className="text-primary font-medium px-8">
									Get Started — It's Free
								</Button>
							</Link>
							<Link to="/pricing">
								<Button
									size="lg"
									variant="outline"
									className="text-white border-white hover:bg-white/10 font-medium px-8"
								>
									View Pricing
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default Index;
