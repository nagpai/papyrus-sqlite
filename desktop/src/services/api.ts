import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const message = error.response?.data?.error || 'An error occurred';

        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        } else if (error.response?.status !== 404) {
          // Don't show toast for 404 errors
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await this.client.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }

  async createLibrarian(data: any) {
    const response = await this.client.post('/auth/librarians', data);
    return response.data;
  }

  async getAllLibrarians() {
    const response = await this.client.get('/auth/librarians');
    return response.data;
  }

  // Book endpoints
  async getBooks(params?: any) {
    const response = await this.client.get('/books', { params });
    return response.data;
  }

  async getBook(id: number) {
    const response = await this.client.get(`/books/${id}`);
    return response.data;
  }

  async getBookWithHistory(id: number) {
    const response = await this.client.get(`/books/${id}/history`);
    return response.data;
  }

  async createBook(data: any) {
    const response = await this.client.post('/books', data);
    return response.data;
  }

  async updateBook(id: number, data: any) {
    const response = await this.client.put(`/books/${id}`, data);
    return response.data;
  }

  async deleteBook(id: number) {
    const response = await this.client.delete(`/books/${id}`);
    return response.data;
  }

  async getGenres() {
    const response = await this.client.get('/books/genres');
    return response.data;
  }

  // Borrower endpoints
  async getBorrowers(params?: any) {
    const response = await this.client.get('/borrowers', { params });
    return response.data;
  }

  async getBorrower(id: number) {
    const response = await this.client.get(`/borrowers/${id}`);
    return response.data;
  }

  async getBorrowerWithHistory(id: number) {
    const response = await this.client.get(`/borrowers/${id}/history`);
    return response.data;
  }

  async createBorrower(data: any) {
    const response = await this.client.post('/borrowers', data);
    return response.data;
  }

  async updateBorrower(id: number, data: any) {
    const response = await this.client.put(`/borrowers/${id}`, data);
    return response.data;
  }

  async deleteBorrower(id: number) {
    const response = await this.client.delete(`/borrowers/${id}`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactions(params?: any) {
    const response = await this.client.get('/transactions', { params });
    return response.data;
  }

  async borrowBook(data: { book_id: number; borrower_id: number; notes?: string }) {
    const response = await this.client.post('/transactions/borrow', data);
    return response.data;
  }

  async returnBook(data: { transaction_id: number; fine_paid?: boolean; notes?: string }) {
    const response = await this.client.post('/transactions/return', data);
    return response.data;
  }

  async getOverdueTransactions() {
    const response = await this.client.get('/transactions/overdue');
    return response.data;
  }

  async getTransactionStats() {
    const response = await this.client.get('/transactions/stats');
    return response.data;
  }

  // Search endpoints
  async universalSearch(query: string, limit?: number) {
    const response = await this.client.get('/search', { params: { q: query, limit } });
    return response.data;
  }

  async searchBooks(params: any) {
    const response = await this.client.get('/search/books', { params });
    return response.data;
  }

  async searchBorrowers(params: any) {
    const response = await this.client.get('/search/borrowers', { params });
    return response.data;
  }

  // Report endpoints
  async getMostBorrowedBooks(limit?: number) {
    const response = await this.client.get('/reports/most-borrowed', { params: { limit } });
    return response.data;
  }

  async getActiveBorrowers() {
    const response = await this.client.get('/reports/active-borrowers');
    return response.data;
  }

  async getOverdueBooks() {
    const response = await this.client.get('/reports/overdue');
    return response.data;
  }

  async getLibraryStats() {
    const response = await this.client.get('/reports/library-stats');
    return response.data;
  }

  async getLibrarianStats() {
    const response = await this.client.get('/reports/librarian-stats');
    return response.data;
  }

  async exportMostBorrowedBooks(limit?: number) {
    const response = await this.client.get('/reports/export/most-borrowed', {
      params: { limit },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportOverdueBooks() {
    const response = await this.client.get('/reports/export/overdue', {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportLibrarianActivity(startDate?: string, endDate?: string) {
    const response = await this.client.get('/reports/export/librarian-activity', {
      params: { start_date: startDate, end_date: endDate },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const api = new ApiClient();
