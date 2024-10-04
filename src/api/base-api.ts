import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8080',
});

export interface FetchResponse<T> {
  count: number;
  next: string | null;
  results: T[];
}

export default axiosInstance;
