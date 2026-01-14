/**
 * API Client Utility
 * 
 * Provides a centralized API client using fetch with axios-like interface.
 * Handles authentication, error handling, and request/response transformation.
 * 
 * @package Lovable/src/lib
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * API Client Configuration
 */
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API Response wrapper
 */
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * API Client Class
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    const user = localStorage.getItem('church_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Build full URL
   */
  private buildURL(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseURL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  }

  /**
   * Build headers with authentication
   * 
   * Automatically includes the Bearer token in the Authorization header
   * if a token is found in localStorage.
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle 401 Unauthorized responses
   * 
   * When a 401 error is received, it means the authentication token is invalid
   * or expired. This method clears the local authentication data and redirects
   * the user to the login page.
   * 
   * This prevents users from making authenticated requests with invalid tokens
   * and ensures they re-authenticate when their session expires.
   */
  private handleUnauthorized(): void {
    // Clear authentication data from localStorage
    localStorage.removeItem('church_user');

    // Only redirect if we're in a browser environment and not already on login page
    // This prevents infinite redirect loops
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/auth/login') ||
        currentPath.includes('/auth/register') ||
        currentPath === '/';

      if (!isAuthPage) {
        // Store the current path to redirect back after login
        const returnUrl = currentPath + window.location.search;
        window.location.href = `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
      }
    }
  }

  /**
   * Handle API response
   * 
   * Processes the HTTP response, extracts JSON data, and handles errors.
   * Special handling for 401 Unauthorized responses to automatically
   * clear authentication and redirect to login.
   * 
   * @param response - The fetch Response object
   * @returns Promise resolving to ApiResponse with typed data
   * @throws Error with status code and error message if request failed
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: T;
    if (isJson) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        this.handleUnauthorized();
      }

      // Extract error message from response data
      // Backend may return error in different formats:
      // - { message: "Error message" }
      // - { error: "Error message" }
      // - { errors: { field: ["Error message"] } }
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (data && typeof data === 'object') {
        const errorData = data as Record<string, unknown>;

        // Try to extract error message from various possible formats
        if (errorData.message) {
          errorMessage = String(errorData.message);
        } else if (errorData.error) {
          errorMessage = String(errorData.error);
        } else if (errorData.errors && typeof errorData.errors === 'object') {
          // Laravel validation errors format
          const errors = errorData.errors as Record<string, unknown>;
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = String(firstError[0]);
          }
        }
      }

      // Create error object with status code and response data
      const error = new Error(errorMessage) as Error & { status: number; data: T };
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Make request with timeout
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const headers = this.buildHeaders(options.headers as Record<string, string>);

    // If sending FormData, DO NOT set Content-Type manually; the browser will set the multipart boundary.
    // Keeping 'application/json' here breaks file uploads on many servers.
    if (typeof FormData !== "undefined" && options.body instanceof FormData) {
      delete (headers as Record<string, string>)["Content-Type"];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  // async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  //   return this.makeRequest<T>(endpoint, {
  //     method: 'POST',
  //     body: data ? JSON.stringify(data) : undefined,
  //   });
  // }
  /**
 * POST request (JSON or FormData)
 */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown | FormData,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;

    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data
        ? isFormData
          ? data
          : JSON.stringify(data)
        : undefined,
      headers: { ...(isFormData ? undefined : { "Content-Type": "application/json" }), ...headers },  
    });
  }


  /**
   * POST multipart/form-data (file upload)
   */
  async postForm<T = unknown>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: formData,
    });
  }

  /**
   * PUT request
   */
  // async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  //   return this.makeRequest<T>(endpoint, {
  //     method: 'PUT',
  //     body: data ? JSON.stringify(data) : undefined,
  //   });
  // }
  /**
 * PUT request (JSON or FormData)
 */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown | FormData,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data
        ? isFormData
          ? data
          : JSON.stringify(data)
        : undefined,
      headers: { ...(isFormData ? undefined : { "Content-Type": "application/json" }), ...headers },
    });
  }


  /**
   * PATCH request
   */
  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;

