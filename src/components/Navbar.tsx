import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const navigate = useNavigate();

	// Periksa status login saat komponen dimuat
	useEffect(() => {
		const token = localStorage.getItem('token');
		setIsLoggedIn(!!token);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setIsLoggedIn(false);
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
					<Link
						to="/pricing"
						className="text-gray-700 hover:text-primary transition-colors duration-200"
					>
						Harga
					</Link>

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
						<Link
							to="/pricing"
							className="text-gray-700 hover:text-primary transition-colors duration-200 py-2"
							onClick={() => setIsOpen(false)}
						>
							Harga
						</Link>

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
