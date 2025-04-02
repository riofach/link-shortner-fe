import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Payment status types
export enum PaymentStatus {
	PENDING = 'pending',
	SUCCESS = 'success',
	FAILURE = 'failure',
	EXPIRED = 'expired',
	CHALLENGE = 'challenge',
}

// Payment response type
export interface PaymentResponse {
	payment: {
		id: number;
		user_id: number;
		order_id: string;
		amount: string;
		payment_type: string;
		transaction_status: PaymentStatus;
		created_at: string;
	};
	redirectUrl: string;
	token?: string;
}

// Pending payment data stored locally
export interface PendingPaymentData {
	hasPendingPayment: boolean;
	timestamp: number;
	paymentId?: number;
	orderId?: string;
	userId?: number;
	createdAt?: string;
	redirectUrl?: string;
}

// Subscription data type
export interface SubscriptionData {
	subscription: {
		id: number;
		user_id: number;
		plan_type: 'free' | 'pro';
		start_date: string | null;
		end_date: string | null;
		payment_id: number | null;
		payment_status: string | null;
	};
	limits: {
		links_per_day: number;
		links_created_today: number;
		custom_code_allowed: boolean;
		analytics_allowed: boolean;
	};
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication token
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		const token = localStorage.getItem('token');
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
		return config;
	},
	(error: AxiosError) => {
		console.error('API Request Error:', error);
		return Promise.reject(error);
	}
);

// Add response interceptor for error handling
api.interceptors.response.use(
	(response: AxiosResponse): AxiosResponse => {
		console.log(
			`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${
				response.config.url
			}`
		);
		return response;
	},
	(error: AxiosError) => {
		if (error.response) {
			const { status, data } = error.response;

			// Handle authentication errors
			if (status === 401) {
				// Clear auth data
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				localStorage.removeItem('subscription_status');
				localStorage.removeItem('subscription_cache_time');
				localStorage.removeItem('subscription_raw_data');

				// Redirect to login if not already there
				if (!window.location.pathname.includes('/login')) {
					window.location.href = '/login';
				}
			}

			// Log error details for debugging
			console.error('API Error Response:', {
				status,
				data,
				url: error.config?.url,
				method: error.config?.method?.toUpperCase(),
			});
		} else if (error.request) {
			// Network error - request made but no response received
			console.error('Network Error:', error.message);
		} else {
			console.error('API Configuration Error:', error.message);
		}

		return Promise.reject(error);
	}
);

// Authentication API
export const authAPI = {
	login: async (email: string, password: string) => {
		try {
			const response = await api.post('/auth/login', { email, password });
			return response.data;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	},

	register: async (email: string, password: string, name?: string) => {
		try {
			const response = await api.post('/auth/register', { email, password, name });
			return response.data;
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		}
	},

	getProfile: async () => {
		try {
			const response = await api.get('/auth/profile');
			return response.data;
		} catch (error) {
			console.error('Profile fetch error:', error);
			throw error;
		}
	},
};

// URL shortening API
export const urlAPI = {
	createShortUrl: async (originalUrl: string, customCode?: string) => {
		try {
			const response = await api.post('/api/url', { originalUrl, customCode });
			return response.data;
		} catch (error) {
			console.error('URL creation error:', error);
			throw error;
		}
	},

	getUserUrls: async () => {
		try {
			const response = await api.get('/api/url/user');
			return response.data;
		} catch (error) {
			console.error('User URLs fetch error:', error);
			throw error;
		}
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
		try {
			const response = await api.delete(`/api/url/${code}`);
			return response.data;
		} catch (error) {
			console.error(`Error deleting URL with code ${code}:`, error);
			throw error;
		}
	},

	getDashboardStats: async () => {
		try {
			const response = await api.get('/api/url/dashboard-stats');
			return response.data;
		} catch (error) {
			console.error('Dashboard stats fetch error:', error);
			throw error;
		}
	},
};

// Subscription and payment API
export const subscriptionAPI = {
	// Get user subscription data with caching
	getUserSubscription: async (): Promise<SubscriptionData> => {
		try {
			// Create abort controller for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 8000);

			const response = await api.get('/api/subscription', {
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			const data = response.data as SubscriptionData;
			if (!data || !data.subscription) {
				throw new Error('Invalid subscription data format');
			}

			// Cache subscription data
			localStorage.setItem('subscription_raw_data', JSON.stringify(data));
			localStorage.setItem('subscription_cache_time', new Date().getTime().toString());

			// Store isPro status separately for quick access
			const isPro = data.subscription.plan_type === 'pro';
			localStorage.setItem('subscription_status', JSON.stringify({ isPro }));

			return data;
		} catch (error) {
			console.error('Error fetching subscription:', error);

			// Handle timeout or network errors by using cached data
			if (axios.isCancel(error) || (error as Error).message?.includes('network')) {
				console.warn('Network error in subscription fetch, using cached data');

				// Try to use cached raw data first
				const cachedRawData = localStorage.getItem('subscription_raw_data');
				if (cachedRawData) {
					try {
						return JSON.parse(cachedRawData) as SubscriptionData;
					} catch (parseError) {
						console.error('Error parsing cached subscription data', parseError);
					}
				}

				// Fall back to simplified data
				const cachedStatus = localStorage.getItem('subscription_status');
				if (cachedStatus) {
					try {
						const { isPro } = JSON.parse(cachedStatus);
						return {
							subscription: {
								plan_type: isPro ? 'pro' : 'free',
								id: 0,
								user_id: 0,
								start_date: null,
								end_date: null,
								payment_id: null,
								payment_status: null,
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

			throw error;
		}
	},

	// Create new subscription payment
	createSubscription: async (): Promise<PaymentResponse> => {
		try {
			console.log('Creating subscription payment...');
			const response = await api.post('/api/subscription');
			console.log('Subscription creation response:', response.data);

			// Validate the response
			if (!response.data || !response.data.payment || !response.data.redirectUrl) {
				console.error('Invalid subscription response format:', response.data);
				throw new Error('Invalid response format from server');
			}

			return response.data as PaymentResponse;
		} catch (error) {
			console.error('Error creating subscription:', error);
			throw error;
		}
	},

	// Check if user has pending payments
	checkPendingPayment: async (): Promise<PendingPaymentData> => {
		try {
			const response = await api.get('/api/subscription/payment-status');
			return response.data as PendingPaymentData;
		} catch (error) {
			console.error('Error checking pending payment:', error);

			// Try fallback to localStorage if API fails
			const pendingPayment = localStorage.getItem('pending_payment');
			if (pendingPayment) {
				try {
					return JSON.parse(pendingPayment) as PendingPaymentData;
				} catch (e) {
					console.error('Error parsing pending payment data:', e);
				}
			}

			// Default response with no pending payment
			return { hasPendingPayment: false, timestamp: 0 };
		}
	},

	// Get payment URL for a specific order
	getPaymentUrl: async (orderId: string) => {
		try {
			const response = await api.get(`/api/subscription/payment-url/${orderId}`);
			return response.data;
		} catch (error) {
			console.error('Error getting payment URL:', error);
			throw error;
		}
	},

	// Verify payment status (new method)
	verifyPaymentStatus: async (orderId: string) => {
		try {
			const response = await api.get(`/api/subscription/verify-payment/${orderId}`);
			return response.data;
		} catch (error) {
			console.error('Error verifying payment status:', error);
			throw error;
		}
	},
};

export default api;
