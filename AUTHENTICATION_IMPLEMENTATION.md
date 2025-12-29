# Authentication Implementation Summary

## Overview

This document describes the complete authentication system implementation for the Lovable frontend application. The system integrates with the Laravel backend API using Sanctum authentication and provides a seamless user experience with automatic token management, error handling, and session persistence.

## Implementation Date

December 2024

## Files Created/Modified

### New Files Created

1. **`src/services/auth.service.ts`**
   - Complete authentication service layer
   - Handles all API calls for authentication operations
   - Well-documented with JSDoc comments
   - Type-safe interfaces for all operations

### Files Modified

1. **`src/lib/apiClient.ts`**
   - Added 401 Unauthorized error handling
   - Automatic redirect to login on token expiration
   - Enhanced error message extraction
   - Support for Laravel validation error format

2. **`src/contexts/AuthContext.tsx`**
   - Replaced mock authentication with real API calls
   - Token management and storage
   - User profile fetching on app initialization
   - Token validation on mount
   - Role mapping from backend to frontend

3. **`src/pages/auth/Login.tsx`**
   - Added support for redirect query parameters
   - Handles redirects from 401 auto-redirect
   - Maintains security with path validation

4. **`src/pages/auth/ResetPassword.tsx`**
   - Updated to include email parameter
   - Matches backend API requirements

## Key Features Implemented

### 1. Authentication Service (`auth.service.ts`)

**Methods:**
- `login(credentials)` - Authenticate user with email/password
- `register(data)` - Create new user account
- `logout()` - Invalidate token and clear session
- `getCurrentUser()` - Fetch authenticated user profile
- `forgotPassword(data)` - Request password reset email
- `resetPassword(data)` - Reset password with token

**Key Features:**
- Type-safe interfaces for all operations
- Comprehensive error handling
- JSDoc documentation for all methods
- Consistent API response handling

### 2. API Client Enhancements (`apiClient.ts`)

**401 Unauthorized Handling:**
- Automatically detects 401 responses
- Clears invalid authentication data
- Redirects to login with return URL
- Prevents infinite redirect loops

**Error Message Extraction:**
- Supports multiple error formats:
  - `{ message: "Error" }`
  - `{ error: "Error" }`
  - `{ errors: { field: ["Error"] } }` (Laravel validation)

### 3. AuthContext Updates (`AuthContext.tsx`)

**Token Management:**
- Maps `access_token` from backend to `token` in frontend
- Stores token with user data in localStorage
- Validates token on app initialization
- Automatically fetches fresh user profile on mount

**Role Mapping:**
- Transforms backend roles to frontend UserRole type
- Handles Spatie permissions (array format)
- Supports string and object role formats
- Maps: `super_admin`, `admin`, `user`

**User Initialization:**
- On app load, checks localStorage for existing session
- Validates token by fetching current user profile
- Updates user data with fresh profile
- Clears invalid/expired tokens automatically

### 4. Login Flow

**Process:**
1. User enters email and password
2. Calls `authService.login()` with credentials
3. Backend returns `{ access_token, user }`
4. Token is mapped to `token` field
5. User data is transformed and stored
6. Redirects to appropriate page (with redirect support)

**Redirect Handling:**
- Supports redirect from query parameter (`?redirect=/path`)
- Supports redirect from location state (protected routes)
- Validates redirect paths for security
- Defaults to `/dashboard` if no redirect specified

### 5. Token Storage

**Format:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "token": "bearer-token-here",
  "role": "admin",
  ...
}
```

**Storage Key:** `church_user` in localStorage

### 6. Automatic Token Validation

**On App Load:**
1. Checks localStorage for `church_user`
2. If token exists, calls `authService.getCurrentUser()`
3. If successful, updates user data with fresh profile
4. If failed (401), clears invalid token and logs out

**On API Calls:**
- Token automatically included in `Authorization: Bearer {token}` header
- 401 responses trigger automatic logout and redirect

## Backend Integration

### API Endpoints Used

1. **POST `/api/auth/login`**
   - Request: `{ email, password }`
   - Response: `{ access_token, token_type, user }`

2. **POST `/api/auth/register`**
   - Request: `{ name, email, password, password_confirmation, phone? }`
   - Response: `{ access_token, token_type, user }`

3. **POST `/api/auth/logout`**
   - Requires: `Authorization: Bearer {token}`
   - Response: `{ message: "Successfully logged out" }`

4. **GET `/api/auth/user`**
   - Requires: `Authorization: Bearer {token}`
   - Response: `{ user: {...} }`

5. **POST `/api/auth/forgot-password`**
   - Request: `{ email }`
   - Response: `{ message: "..." }`

6. **POST `/api/auth/reset-password`**
   - Request: `{ email, password, password_confirmation, token }`
   - Response: `{ message: "..." }`

### Middleware

All protected routes use `auth:sanctum` middleware:
- Posts CRUD operations
- User profile endpoints
- Admin operations

## Security Features

1. **Path Validation**
   - Redirect paths are validated to prevent open redirect attacks
   - Only relative paths starting with `/` are allowed
   - External URLs are rejected

2. **Token Security**
   - Tokens stored in localStorage (consider httpOnly cookies for production)
   - Tokens automatically cleared on 401 errors
   - No token exposure in URLs or logs

3. **Error Handling**
   - Generic error messages for security
   - Detailed errors only in development
   - No sensitive data in error responses

## Usage Examples

### Login
```typescript
const { login } = useAuth();

const result = await login('user@example.com', 'password123');
if (result.success) {
  // User is logged in
} else {
  console.error(result.error);
}
```

### Check Authentication
```typescript
const { user, isLoading } = useAuth();

if (isLoading) {
  return <Loading />;
}

if (!user) {
  return <LoginRequired />;
}

// User is authenticated
```

### Check Roles
```typescript
const { isAdmin, isSuperAdmin, hasRole } = useAuth();

if (isAdmin()) {
  // User is admin or super_admin
}

if (isSuperAdmin()) {
  // User is super_admin only
}

if (hasRole('admin')) {
  // User has specific role
}
```

### Logout
```typescript
const { logout } = useAuth();

await logout(); // Clears token and redirects
```

## Testing Checklist

- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Token stored correctly in localStorage
- [x] Token included in API requests
- [x] 401 errors trigger logout and redirect
- [x] User profile loads on app initialization
- [x] Token validation on page refresh
- [x] Logout clears token and user data
- [x] Protected routes require authentication
- [x] Role-based access control works
- [x] Redirect after login works correctly
- [x] Password reset flow works

## Known Issues & Future Improvements

### Current Limitations

1. **Token Storage**
   - Currently using localStorage
   - Consider httpOnly cookies for enhanced security in production

2. **Token Refresh**
   - No automatic token refresh mechanism
   - Users must re-login when token expires
   - Consider implementing refresh tokens if backend supports it

3. **Profile Updates**
   - `updateProfile` currently only updates local state
   - Should call API endpoint to persist changes

### Recommended Improvements

1. **Token Refresh**
   - Implement refresh token mechanism
   - Auto-refresh before expiration
   - Seamless user experience

2. **Session Management**
   - Multiple tab support
   - Session synchronization
   - Activity tracking

3. **Enhanced Security**
   - httpOnly cookies for tokens
   - CSRF protection
   - Rate limiting on auth endpoints

4. **User Profile API**
   - Implement profile update endpoint
   - Avatar upload support
   - Password change functionality

## Troubleshooting

### 401 Unauthorized Errors

**Symptoms:**
- API calls return 401
- User is redirected to login
- Token appears to be invalid

**Solutions:**
1. Check if token exists in localStorage
2. Verify token format (should be Bearer token)
3. Check backend token expiration settings
4. Verify user account is active
5. Check CORS settings if cross-origin

### Token Not Persisting

**Symptoms:**
- User logged out on page refresh
- Token not found in localStorage

**Solutions:**
1. Check localStorage is enabled
2. Verify no code clearing localStorage
3. Check browser privacy settings
4. Verify token is being saved after login

### Role Mapping Issues

**Symptoms:**
- User has wrong role
- Admin access not working

**Solutions:**
1. Check backend role format
2. Verify role mapping logic in `mapRole()`
3. Check Spatie permissions format
4. Verify user has correct role in database

## Environment Variables

Ensure `.env` file has:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

For production:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Documentation References

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in implementation files
3. Check browser console for errors
4. Verify backend API is running and accessible

---

**Implementation Status:** ✅ Complete
**Last Updated:** December 2024
**Version:** 1.0.0

