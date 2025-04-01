import axios, { AxiosError } from 'axios';

/**
 * Utility function to fetch data with retry logic and exponential backoff
 * @param fetchFn - The function that performs the fetch operation
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns - The data from the successful fetch
 */
export const fetchWithRetry = async <T>(
	fetchFn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<T> => {
	let retries = 0;

	const execute = async (): Promise<T> => {
		try {
			return await fetchFn();
		} catch (error) {
			// Check if we've reached max retries
			if (retries >= maxRetries) {
				console.error(`Failed after ${retries} retries:`, error);
				throw error;
			}

			// Increment retry counter
			retries++;

			// Calculate delay with exponential backoff: baseDelay * 2^retries + some random jitter
			const delay = baseDelay * Math.pow(2, retries - 1) + Math.random() * 1000;
			console.log(`Retry ${retries}/${maxRetries} after ${Math.round(delay)}ms`);

			// Wait for the delay
			await new Promise((resolve) => setTimeout(resolve, delay));

			// Try again
			return execute();
		}
	};

	return execute();
};

export default fetchWithRetry;
