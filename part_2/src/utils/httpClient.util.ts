import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';

const BASE_URL = config.baseUrl;
const MAX_RETRIES = config.maxRetries;
const BASE_DELAY_MS = config.baseDelay;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async <T>(
  path: string,
  requestConfig: AxiosRequestConfig = {},
  attempt = 0,
): Promise<AxiosResponse<T>> => {
  const url = `${BASE_URL}${path}`;

  try {
    return await axios.get<T>(url, { ...requestConfig, timeout: 10_000 });
  } catch (error: any) {
    const status = error?.response?.status;
    const isRetryable = !status || status === 429 || (status >= 500 && status < 600);

    if (isRetryable && attempt < MAX_RETRIES) {
      const exponentialDelay = BASE_DELAY_MS * 2 ** attempt;
      const jitter = Math.random() * 200;
      const delay = exponentialDelay + jitter;

      console.warn(
        `[HTTP] ${status ?? 'network error'} on ${path} — retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(delay)}ms`,
      );

      await sleep(delay);
      return fetchWithRetry<T>(path, requestConfig, attempt + 1);
    }

    const msg = error?.response?.data?.message ?? error?.message ?? 'Unknown error';
    throw new Error(`[HTTP] Failed ${path} after ${attempt + 1} attempts: ${msg}`);
  }
};
