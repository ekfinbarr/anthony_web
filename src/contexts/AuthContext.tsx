/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Handles user login, logout, registration, and profile management.
 * 
 * This context integrates with the backend API through the auth service
 * and manages authentication tokens and user state in localStorage.
 * 
 * @package Lovable/src/contexts
 */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, BackendUser, LoginCredentials, RegisterData, PasswordResetData } from "@/services/auth.service";

/**
 * User role types
 * 
 * Maps to backend role system:
 * - user: Regular parishioner
 * - admin: Administrator with elevated permissions
 * - super_admin: Super administrator with full system access
 */
export type UserRole = "user" | "admin" | "super_admin";

/**
 * Frontend User interface
 * 
 * This is the user object used throughout the frontend application.
 * It's transformed from the backend user model to include frontend-specific
 * fields like 'token' and normalized 'role'.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  country?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  role: UserRole;
  token?: string; // Authentication token stored with user data
}

/**
 * Extract a human-friendly error message from unknown errors.
 * Works with both native Errors and our ApiClient error shape (Error & { data?: ... }).
 */
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback;

  if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    const data = e["data"];
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      const message = d["message"];
      const err = d["error"];
      if (typeof message === "string" && message.trim()) return message;
      if (typeof err === "string" && err.trim()) return err;
    }
  }

  return fallback;
};

/**
 * User registration data interface
 */
interface RegisterDataInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/**
 * Authentication Context Type
 * 
 * Defines all methods and state available through the AuthContext.
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterDataInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string, email: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 * 
 * Provides access to the authentication context.
 * Must be used within an AuthProvider component.
 * 
 * @returns AuthContextType with user state and authentication methods
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```typescript
 * const { user, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Map backend role to frontend role type
 * 
 * The backend may return roles in various formats (string, array, etc.)
 * This function normalizes them to our frontend UserRole type.
 * 
 * @param backendRole - Role from backend (could be string or role object)
 * @returns Normalized UserRole
 */
const mapRole = (backendRole: string | undefined): UserRole => {
  if (!backendRole) return "user";
  
  const roleLower = backendRole.toLowerCase();
  
  // Check for super admin roles
  if (roleLower.includes("super") || roleLower.includes("super_admin") || roleLower === "superadmin") {
    return "super_admin";
  }
  
  // Check for admin roles
  if (roleLower.includes("admin") || roleLower === "administrator") {
    return "admin";
  }
  
  // Default to regular user
  return "user";
};

/**
 * Transform backend user to frontend user format
 * 
 * Converts the backend user model (which uses 'access_token') to our
 * frontend user model (which uses 'token'). Also normalizes roles and
 * ensures all required fields are present.
 * 
 * @param authUser - User object from backend API
 * @param token - Authentication token (from 'access_token' in response)
 * @returns Transformed User object for frontend use
 */
const transformUser = (authUser: BackendUser, token: string): User => {
  // Handle roles from Spatie permissions (could be array or string)
  // Backend may return roles as an array of objects: [{ name: "admin" }]
  // or as a simple string: "admin"
  let roleName = "user";
  
  // Safely check if authUser exists and has roles
  if (authUser && authUser.roles && Array.isArray(authUser.roles) && authUser.roles.length > 0) {
    // Extract role name from first role object
    roleName = authUser.roles[0]?.name || "user";
  } else if (authUser && authUser.role) {
    // Use direct role string if available
    roleName = authUser.role;
  }
  
  // Ensure authUser exists before accessing properties
  if (!authUser) {
    throw new Error("Invalid user data received from server");
  }
  
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    phone: authUser.phone,
    avatar: authUser.avatar,
    isVerified: authUser.isVerified ?? true,
    createdAt: authUser.created_at || new Date().toISOString(),
    role: mapRole(roleName),
    token, // Store token with user data for API client to access
  };
};

/**
 * AuthProvider Component
 * 
 * Provides authentication context to all child components.
 * Manages user state, authentication tokens, and provides methods
 * for login, logout, registration, etc.
 * 
 * On mount, it attempts to restore user session from localStorage
 * and validates the token by fetching the current user profile.
 * 
 * @param children - Child components to wrap with auth context
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication on mount
   * 
   * Checks localStorage for existing user session and validates
   * the token by fetching the current user profile from the API.
   * If the token is invalid or expired, clears the session.
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("church_user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // If we have a token, verify it's still valid by fetching user profile
          if (userData.token) {
            try {
              // Fetch fresh user data from API to validate token
              const currentUser = await authService.getCurrentUser();
              
              // Validate that we received valid user data
              if (!currentUser || !currentUser.id) {
                throw new Error("Invalid user data received from server");
              }
              
              // Update user data with fresh profile while preserving token
              const updatedUser = transformUser(currentUser, userData.token);
              setUser(updatedUser);
              
              // Update localStorage with fresh user data
              localStorage.setItem("church_user", JSON.stringify(updatedUser));
            } catch (error) {
              // Token is invalid or expired, clear storage
              console.error("Token validation failed:", error);
              localStorage.removeItem("church_user");
              setUser(null);
            }
          } else {
            // No token found, clear invalid data
            localStorage.removeItem("church_user");
            setUser(null);
          }
        }
      } catch (error) {
        // Error parsing stored user data, clear it
        console.error("Auth initialization error:", error);
        localStorage.removeItem("church_user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user with email and password
   * 
   * Authenticates the user with the backend API and stores the
   * authentication token and user data in localStorage.
   * 
   * @param email - User email address
   * @param password - User password
   * @returns Object with success status and optional error message
   * 
   * @example
   * ```typescript
   * const result = await login('user@example.com', 'password123');
   * if (result.success) {
   *   // User is logged in
   * }
   * ```
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call backend login API
      const response = await authService.login({ email, password });
      
      // Transform backend response to frontend format
      // Backend returns 'access_token', we map it to 'token'
      const transformedUser = transformUser(
        response.user,
        response.access_token // Map access_token to token
      );
      
      // Update state and localStorage
      setUser(transformedUser);
      localStorage.setItem("church_user", JSON.stringify(transformedUser));
      
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, "Invalid email or password") };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user account
   * 
   * Creates a new user account and automatically logs them in.
   * 
   * @param data - User registration data
   * @returns Object with success status and optional error message
   */
  const register = async (data: RegisterDataInput) => {
    setIsLoading(true);
    try {
      // Prepare registration data for backend
      const registerData: RegisterData = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password, // Backend requires confirmation
        phone: data.phone,
      };
      
      // Call backend registration API
      const response = await authService.register(registerData);
      
      // Transform and store user data
      const transformedUser = transformUser(
        response.user,
        response.access_token
      );
      
      setUser(transformedUser);
      localStorage.setItem("church_user", JSON.stringify(transformedUser));
      
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, "Registration failed") };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * 
   * Invalidates the authentication token on the server and clears
   * local user data. This method is async to allow the logout API
   * call to complete, but it will always clear local data even if
   * the API call fails.
   */
  const logout = async () => {
    try {
      // Attempt to invalidate token on server
      await authService.logout();
    } catch (error) {
      // Even if logout API fails, we still clear local data
      console.error("Logout error:", error);
    } finally {
      // Always clear local state and storage
      setUser(null);
      localStorage.removeItem("church_user");
    }
  };

  /**
   * Update user profile
   * 
   * Updates the user's profile information. Currently updates local
   * state only. In a full implementation, this would call an API
   * endpoint to update the user on the server.
   * 
   * @param data - Partial user data to update
   * @returns Object with success status and optional error message
   */
  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    
    try {
      // TODO: Implement API call to update user profile
      // For now, update local state only
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("church_user", JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, "Update failed") };
    }
  };

  /**
   * Request password reset link
   * 
   * Sends a password reset email to the specified email address.
   * 
   * @param email - User email address
   * @returns Object with success status and optional error message
   */
  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword({ email });
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, "Failed to send reset link") };
    }
  };

  /**
   * Reset password with token
   * 
   * Resets the user's password using a token received via email.
   * 
   * @param token - Password reset token from email
   * @param password - New password
   * @param email - User email address (required by backend)
   * @returns Object with success status and optional error message
   */
  const resetPassword = async (token: string, password: string, email: string) => {
    try {
      const resetData: PasswordResetData = {
        email,
        password,
        password_confirmation: password,
        token,
      };
      
      await authService.resetPassword(resetData);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error, "Failed to reset password") };
    }
  };

  /**
   * Refresh user profile from API
   * 
   * Fetches the latest user data from the server and updates
   * local state. Useful for syncing user data after profile updates
   * or when you need to ensure you have the latest user information.
   * 
   * If the refresh fails (e.g., token expired), automatically logs out.
   */
  const refreshUser = async () => {
    if (!user?.token) {
      return;
    }
    
    try {
      const currentUser = await authService.getCurrentUser();
      const updatedUser = transformUser(currentUser, user.token);
      
      setUser(updatedUser);
      localStorage.setItem("church_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, token is likely invalid - logout user
      await logout();
    }
  };

  /**
   * Check if user has specific role
   * 
   * @param role - Role to check
   * @returns True if user has the specified role
   */
  const hasRole = (role: UserRole) => user?.role === role;

  /**
   * Check if user is admin (admin or super_admin)
   * 
   * @returns True if user is admin or super_admin
   */
  const isAdmin = () => user?.role === "admin" || user?.role === "super_admin";

  /**
   * Check if user is super admin
   * 
   * @returns True if user is super_admin
   */
  const isSuperAdmin = () => user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        hasRole,
        isAdmin,
        isSuperAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
