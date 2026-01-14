/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including login, logout,
 * registration, password reset, and user profile management.
 * 
 * This service provides a clean interface for authentication operations
 * and abstracts away the API implementation details.
 * 
 * @package Lovable/src/services
 */

import { apiClient } from '../lib/apiClient';

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User registration data interface
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

/**
 * Authentication response from backend
 * 
 * The backend returns 'access_token' which we map to 'token' in the frontend
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

/**
 * Backend user model structure
 * 
 * This matches the structure returned by the Laravel backend
 */
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  roles?: Array<{ name: string }>;
  isVerified?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset data interface
 */
export interface PasswordResetData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

/**
 * Authentication Service
 * 
 * Provides methods for all authentication operations:
 * - User login and logout
 * - User registration
 * - Password reset functionality
 * - Current user profile retrieval
 */
export const authService = {
  /**
   * Login user with email and password
   * 
   * @param credentials - User email and password
   * @returns Authentication response with token and user data
   * @throws Error if login fails
   * 
   * @example
   * ```typescript
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * ```
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user account
   * 
   * @param data - User registration data
   * @returns Authentication response with token and user data
   * @throws Error if registration fails
   * 
   * @example
   * ```typescript
   * const response = await authService.register({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'password123',
   *   password_confirmation: 'password123',
   *   phone: '+1234567890'
   * });
   * ```
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('auth/register', data);
    return response.data;
  },

  /**
   * Logout current user
   * 
   * Invalidates the current authentication token on the server.
   * Note: This method will not throw errors if the API call fails,
   * as logout should always succeed locally even if server call fails.
   * 
   * @returns Promise that resolves when logout is complete
   * 
   * @example
   * ```typescript
   * await authService.logout();
   * ```
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('auth/logout');
    } catch (error) {
      // Even if logout API call fails, we should still clear local storage
      // This ensures the user is logged out locally regardless of server response
      console.error('Logout API call failed:', error);
    }
  },

  /**
   * Get current authenticated user profile
   * 
   * Fetches the user profile for the currently authenticated user.
   * This endpoint requires a valid authentication token.
   * 
   * @returns Current user data
   * @throws Error if user is not authenticated or token is invalid
   * 
   * @example
   * ```typescript
   * const user = await authService.getCurrentUser();
   * console.log(user.name, user.email);
   * ```
   */
  async getCurrentUser(): Promise<BackendUser> {
    // Backend returns user directly, not wrapped in { user: ... }
    const response = await apiClient.get<BackendUser>('auth/user');
    return response.data;
  },

  /**
   * Request password reset link
   * 
   * Sends a password reset email to the specified email address.
   * 
   * @param data - Password reset request data containing email
   * @returns Promise that resolves when request is sent
   * @throws Error if email is invalid or not found
   * 
   * @example
   * ```typescript
   * await authService.forgotPassword({ email: 'user@example.com' });
   * ```
   */
  async forgotPassword(data: PasswordResetRequest): Promise<void> {
    await apiClient.post('auth/forgot-password', data);
  },

  /**
   * Reset password with token
   * 
   * Resets the user's password using a token received via email.
   * 
   * @param data - Password reset data including token, email, and new password
   * @returns Promise that resolves when password is reset
   * @throws Error if token is invalid or expired
   * 
   * @example
   * ```typescript
   * await authService.resetPassword({
   *   email: 'user@example.com',
   *   password: 'newpassword123',
   *   password_confirmation: 'newpassword123',
   *   token: 'reset-token-from-email'
   * });
   * ```
   */
  async resetPassword(data: PasswordResetData): Promise<void> {
    await apiClient.post('auth/reset-password', data);
  },
};

