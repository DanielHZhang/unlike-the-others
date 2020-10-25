import Axios, {AxiosError} from 'axios';
import {ROOT_URL} from 'src/shared/constants';
import type {FastifyReplyError} from 'src/shared/types';

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

export function isAxiosError(error: any): error is Required<AxiosError<FastifyReplyError>> {
  return error.isAxiosError && error.response && error.response.data;
}
