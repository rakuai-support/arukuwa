/**
 * API Service
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '@/constants';
import type { ApiResponse, ApiError } from '@/types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError<ApiResponse>): ApiError {
    if (error.response) {
      // Server responded with error
      return error.response.data?.error || {
        code: 'SERVER_ERROR',
        message: error.response.statusText || 'サーバーエラーが発生しました',
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        code: 'NETWORK_ERROR',
        message: 'ネットワークエラーが発生しました',
      };
    } else {
      // Something else happened
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || '不明なエラーが発生しました',
      };
    }
  }

  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url);
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }
}

export const api = new ApiService();
