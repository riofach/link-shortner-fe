import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Pricing from '@/pages/Pricing';
import Analytics from '@/pages/Analytics';
import Payment from '@/pages/Payment';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/pricing" element={<Pricing />} />
				<Route path="/analytics/:code" element={<Analytics />} />
				<Route path="/payment/:status" element={<Payment />} />
				<Route path="/404" element={<NotFound />} />
				<Route path="*" element={<Navigate replace to="/404" />} />
			</Routes>

			{/* Toast notifications */}
			<Toaster />
			<SonnerToaster position="top-right" theme="light" expand={true} richColors />
		</Router>
	);
}

export default App;
