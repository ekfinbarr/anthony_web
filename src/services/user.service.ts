/**
 * User API Service
 * 
 * Provides typed API methods for managing user profiles.
 * Handles profile updates and user management operations.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * User Model
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  avatar?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Update User Profile Payload
 */
export interface UpdateUserProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  country?: string;
  avatar?: string;
}

/**
 * Update Password Payload
 */
export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Query Parameters
 */
export interface UserQueryParams {
  page?: number;
  per_page?: number;
  role?: string;
  verified?: boolean;
  search?: string;
}

/**
 * List users with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of users
 */
export const list = async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('users', params);
  return response.data;
};

/**
 * Get user by ID
 * 
 * @param id User ID
 * @returns User details
 */
export const getById = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`users/${id}`);
  return response.data;
};

/**
 * Get current authenticated user
 * 
 * @returns Current user details
 */
export const getCurrent = async (): Promise<User> => {
  const response = await apiClient.get<User>('users/me');
  return response.data;
};

/**
 * Update user profile
 * 
 * @param id User ID
 * @param payload Updated profile data
 * @returns Updated user
 */
export const updateProfile = async (
  id: string,
  payload: UpdateUserProfilePayload
): Promise<User> => {
  const response = await apiClient.put<User>(`users/${id}/profile`, payload);
  return response.data;
};

/**
 * Update user password
 * 
 * @param id User ID
 * @param payload Password update data
 * @returns Success response
 */
export const updatePassword = async (
  id: string,
  payload: UpdatePasswordPayload
): Promise<void> => {
  await apiClient.put(`users/${id}/password`, payload);
};

/**
 * Get users by role
 * 
 * @param role User role
 * @param params Query parameters
 * @returns Paginated list of users
 */
export const getByRole = async (
  role: string,
  params?: UserQueryParams
): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>(`users/role/${role}`, params);
  return response.data;
};

/**
 * Get verified users
 * 
 * @param params Query parameters
 * @returns Paginated list of verified users
 */
export const getVerified = async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('users/verified', params);
  return response.data;
};

/**
 * Get unverified users
 * 
 * @param params Query parameters
 * @returns Paginated list of unverified users
 */
export const getUnverified = async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('users/unverified', params);
  return response.data;
};

// Export all functions as default object
const userService = {
  list,
  getById,
  getCurrent,
  updateProfile,
  updatePassword,
  getByRole,
  getVerified,
  getUnverified,
};

export default userService;

