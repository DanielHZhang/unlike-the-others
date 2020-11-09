import Axios, {AxiosError} from 'axios';
import {BASE_URL} from 'src/shared/constants';
import type {AccessTokenData, FastifyReplyError} from 'src/shared/types';

export const axios = Axios.create();

// Ensure base URL is set depending on environment
axios.defaults.baseURL = BASE_URL;

// Attach interceptor to add CSRF token before each request
const tokenRegex = /(?:^|;\s*)csrfToken=([^;]+)/;
axios.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (method === 'post' || method === 'put' || method === 'delete') {
    const token = tokenRegex.exec(document.cookie)?.[1];
    config.headers['x-csrf-token'] = token;
  }
  return config;
});

type AxiosResponseError = Required<AxiosError<FastifyReplyError>>;

export function isAxiosError(error: any): error is AxiosResponseError {
  return error.isAxiosError && error.response && error.response.data;
}

export function isNetworkError(error: any): error is Error {
  // For connection errors where the request fails, the message will be "Network Error"
  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    // Rewrite the error message to be more descriptive.
    error.message = 'Network request failed. Check your internet connection.';
    return true;
  }
  return false;
}

export async function fetchAccessToken(): Promise<AccessTokenData> {
  const response = await axios.post<AccessTokenData>('/api/auth/access');
  // Set JWT access token as header on future requests
  axios.defaults.headers.authorization = response.data.accessToken;
  return response.data;
}
