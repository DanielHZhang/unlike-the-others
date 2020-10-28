import Axios, {AxiosError} from 'axios';
import {ROOT_URL} from 'src/shared/constants';
import type {AccessTokenData, FastifyReplyError} from 'src/shared/types';

export const axios = Axios.create();

// Ensure base URL is set depending on environment
axios.defaults.baseURL = `http://${ROOT_URL}`;

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

export type AxiosResponseError = Required<AxiosError<FastifyReplyError>>;
export type Success = {success: true};

export function isAxiosError(error: any): error is AxiosResponseError {
  return error.isAxiosError && error.response && error.response.data;
}

export async function fetchAccessToken(): Promise<AccessTokenData> {
  const response = await axios.post<AccessTokenData>('/api/auth/access');
  // Set JWT access token as header on future requests
  axios.defaults.headers.authorization = response.data.accessToken;
  return response.data;
}
