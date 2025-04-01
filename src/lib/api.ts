import axios from 'axios';

// Buat instance axios dengan konfigurasi dasar
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Tambahkan interceptor untuk menangani token otentikasi
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor respons untuk menangani kesalahan umum
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const { response } = error;

		if (response && response.status === 401) {
			// Token tidak valid atau kedaluwarsa
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}

		return Promise.reject(error);
	}
);

// Fungsi-fungsi API
export const authAPI = {
	login: async (email: string, password: string) => {
		const response = await api.post('/auth/login', { email, password });
		return response.data;
	},

	register: async (email: string, password: string, name?: string) => {
		const response = await api.post('/auth/register', { email, password, name });
		return response.data;
	},

	getProfile: async () => {
		const response = await api.get('/auth/profile');
		return response.data;
	},
};

export const urlAPI = {
	createShortUrl: async (originalUrl: string, customCode?: string) => {
		const response = await api.post('/api/url', { originalUrl, customCode });
		return response.data;
	},

	getUserUrls: async () => {
		const response = await api.get('/api/url/user');
		return response.data;
	},

	getUrlStats: async (code: string) => {
		const response = await api.get(`/api/url/${code}/stats`);
		return response.data;
	},

	deleteUrl: async (code: string) => {
		const response = await api.delete(`/api/url/${code}`);
		return response.data;
	},

	getDashboardStats: async () => {
		const response = await api.get('/api/url/dashboard-stats');
		return response.data;
	},
};

export const subscriptionAPI = {
	getUserSubscription: async () => {
		const response = await api.get('/api/subscription');
		return response.data;
	},

	createSubscription: async () => {
		const response = await api.post('/api/subscription');
		return response.data;
	},
};

export default api;
