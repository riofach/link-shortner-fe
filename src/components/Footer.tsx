import { Link } from 'react-router-dom';

const Footer = () => {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-white border-t border-gray-100 py-8 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-center">
					<div className="flex items-center mb-4 md:mb-0">
						<Link to="/" className="text-xl font-bold text-primary flex items-center space-x-2">
							<span className="text-2xl">⚡</span>
							<span>LinkRio</span>
						</Link>
						<span className="text-gray-500 text-sm ml-4">
							© {year} LinkRio. Hak Cipta Dilindungi.
						</span>
					</div>

					<div className="flex space-x-6">
						<Link to="/privacy" className="text-gray-600 hover:text-primary text-sm">
							Kebijakan Privasi
						</Link>
						<Link to="/terms" className="text-gray-600 hover:text-primary text-sm">
							Syarat & Ketentuan
						</Link>
						<Link to="/contact" className="text-gray-600 hover:text-primary text-sm">
							Hubungi Kami
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
