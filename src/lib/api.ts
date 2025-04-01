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
		console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
		return config;
	},
	(error) => {
		console.error('API Request Error:', error);
		return Promise.reject(error);
	}
);

// Interceptor respons untuk menangani kesalahan umum
api.interceptors.response.use(
	(response) => {
		console.log(
			`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${
				response.config.url
			}`
		);
		return response;
	},
	(error) => {
		const { response } = error;

		console.error('API Response Error:', {
			status: response?.status,
			url: response?.config?.url,
			method: response?.config?.method?.toUpperCase(),
			data: response?.data,
		});

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
		try {
			console.log(`Fetching stats for URL code: ${code}`);
			const response = await api.get(`/api/url/${code}/stats`);
			console.log('Stats response:', response.data);
			return response.data;
		} catch (error) {
			console.error(`Error fetching stats for URL code ${code}:`, error);
			throw error;
		}
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
		try {
			console.log('Fetching subscription data from backend...');
			// Tambahkan timeout untuk menghindari permintaan yang menggantung
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 detik timeout

			const response = await api.get('/api/subscription', {
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			console.log('Subscription data received:', response.data);

			// Verifikasi dan normalisasi respon
			const data = response.data;

			// Pastikan ada property subscription
			if (!data.subscription) {
				console.error('Invalid subscription data format, missing subscription property');
				throw new Error('Invalid subscription data format');
			}

			// Cek dan log tipe langganan
			const planType = data.subscription.plan_type;
			console.log('Plan type:', planType);

			// Pastikan jika subscriptions.plan_type adalah 'pro', maka ini adalah akun pro
			if (planType === 'pro') {
				// Simpan ke localStorage agar cepat diakses
				localStorage.setItem('subscription_status', JSON.stringify({ isPro: true }));
				localStorage.setItem('subscription_cache_time', new Date().getTime().toString());
			}

			return data;
		} catch (error) {
			console.error('Error in getUserSubscription:', error);
			// Jika error adalah timeout atau network error, coba ambil dari cache
			if (error.name === 'AbortError' || error.message?.includes('network')) {
				console.warn('Network error in getUserSubscription, using cached data if available');
				const cachedData = localStorage.getItem('subscription_status');
				const cachedRawData = localStorage.getItem('subscription_raw_data');

				if (cachedRawData) {
					try {
						return JSON.parse(cachedRawData);
					} catch (parseError) {
						console.error('Error parsing cached subscription data', parseError);
					}
				}

				// Jika tidak ada cached full data, gunakan default untuk menghindari crash
				if (cachedData) {
					try {
						const { isPro } = JSON.parse(cachedData);
						return {
							subscription: {
								plan_type: isPro ? 'pro' : 'free',
								id: 0,
								end_date: null,
							},
							limits: {
								links_per_day: isPro ? -1 : 3,
								links_created_today: 0,
								custom_code_allowed: isPro,
								analytics_allowed: isPro,
							},
						};
					} catch (parseError) {
						console.error('Error parsing simplified cached data', parseError);
					}
				}
			}

			// Re-throw error untuk handler di komponen
			throw error;
		}
	},

	createSubscription: async () => {
		const response = await api.post('/api/subscription');
		return response.data;
	},
};

export default api;
