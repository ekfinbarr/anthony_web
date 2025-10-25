/**
 * Email Service for managing waitlist subscriptions
 * This service integrates with the Laravel backend API
 */

interface EmailSubscription {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  source: string;
  status: string;
  subscribed_at: string;
  metadata?: Record<string, any>;
  email_verified?: Boolean
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface EmailProvider {
  subscribe(email: string, additionalData?: Record<string, any>): Promise<void>;
  unsubscribe(email: string): Promise<void>;
  getSubscribers(): Promise<string[]>;
}

// Laravel Backend API Provider
class LaravelApiProvider implements EmailProvider {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  async subscribe(email: string, additionalData: Record<string, any> = {}): Promise<void> {
    const response = await fetch(`${this.baseUrl}/waitinglist/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        email,
        source: 'coming_soon',
        ...additionalData,
        // Add UTM parameters from current URL
        ...this.getUtmParameters(),
      }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      if (response.status === 422 && result.errors) {
        // Validation errors
        const firstError = Object.values(result.errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      }
      throw new Error(result.message || 'Failed to subscribe to waiting list');
    }
  }

  async unsubscribe(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/waitinglist/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ token }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to unsubscribe');
    }
  }

  async getSubscribers(): Promise<string[]> {
    // This would require authentication, not implemented for public use
    throw new Error('Admin function - requires authentication');
  }

  private getUtmParameters(): Record<string, string> {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        utmParams[param] = value;
      }
    });

    return utmParams;
  }
}

// Fallback localStorage provider (for demo/offline use)
class LocalStorageEmailProvider implements EmailProvider {
  private readonly storageKey = 'email_waitlist';

  async subscribe(email: string, additionalData: Record<string, any> = {}): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingSubscriptions = this.getStoredSubscriptions();
    
    // Check if email already exists
    if (existingSubscriptions.some(sub => sub.email === email)) {
      throw new Error('Email already subscribed');
    }

    const newSubscription: EmailSubscription = {
      id: Date.now(),
      email,
      name: additionalData.name,
      phone: additionalData.phone,
      source: additionalData.source || 'coming_soon',
      status: 'active',
      subscribed_at: new Date().toISOString(),
      metadata: {
        ip_address: 'demo',
        user_agent: navigator.userAgent,
        ...additionalData
      }
    };

    existingSubscriptions.push(newSubscription);
    localStorage.setItem(this.storageKey, JSON.stringify(existingSubscriptions));
  }

  async unsubscribe(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingSubscriptions = this.getStoredSubscriptions();
    const filteredSubscriptions = existingSubscriptions.filter(sub => sub.email !== email);
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredSubscriptions));
  }

  async getSubscribers(): Promise<string[]> {
    const subscriptions = this.getStoredSubscriptions();
    return subscriptions.map(sub => sub.email);
  }

  private getStoredSubscriptions(): EmailSubscription[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// Admin API Service (for authenticated admin functions)
class AdminEmailService {
  private readonly baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async getSubscribers(params: {
    page?: number;
    per_page?: number;
    status?: string;
    source?: string;
    search?: string;
    sort_by?: string;
    sort_direction?: string;
  } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/waitinglist?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  async getStats(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/waitinglist/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  async exportSubscribers(params: {
    status?: string;
    source?: string;
  } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/waitinglist/export?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  async deleteSubscriber(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/waitinglist/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  async updateSubscriber(id: number, data: Partial<EmailSubscription>): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/waitinglist/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return response.json();
  }
}

// Main Email Service Class
class EmailServiceClass {
  private provider: EmailProvider;

  constructor() {
    // Try to use Laravel API provider first, fallback to localStorage for demo
    try {
      this.provider = new LaravelApiProvider();
    } catch {
      console.warn('Laravel API not available, falling back to localStorage provider');
      this.provider = new LocalStorageEmailProvider();
    }
  }

  /**
   * Subscribe an email to the waiting list
   */
  async subscribeToWaitingList(
    email: string, 
    additionalData: {
      name?: string;
      phone?: string;
      source?: string;
    } = {}
  ): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      await this.provider.subscribe(email, additionalData);
      
      // Analytics tracking (optional)
      this.trackSubscription(email);
      
      console.log(`Successfully subscribed: ${email}`);
    } catch (error) {
      console.error('Subscription failed:', error);
      
      // If Laravel API fails, try fallback to localStorage
      if (!(this.provider instanceof LocalStorageEmailProvider)) {
        try {
          console.log('Retrying with localStorage fallback...');
          const fallbackProvider = new LocalStorageEmailProvider();
          await fallbackProvider.subscribe(email, additionalData);
          this.trackSubscription(email);
          console.log(`Successfully subscribed with fallback: ${email}`);
        } catch (fallbackError) {
          console.error('Fallback subscription also failed:', fallbackError);
          throw error; // Throw original error
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Unsubscribe an email from the waiting list
   */
  async unsubscribeFromWaitingList(emailOrToken: string): Promise<void> {
    try {
      await this.provider.unsubscribe(emailOrToken);
      console.log(`Successfully unsubscribed: ${emailOrToken}`);
    } catch (error) {
      console.error('Unsubscription failed:', error);
      throw error;
    }
  }

  /**
   * Get all subscribers (admin function)
   */
  async getAllSubscribers(): Promise<string[]> {
    try {
      return await this.provider.getSubscribers();
    } catch (error) {
      console.error('Failed to get subscribers:', error);
      throw error;
    }
  }

  /**
   * Get subscription count
   */
  async getSubscriberCount(): Promise<number> {
    try {
      const subscribers = await this.provider.getSubscribers();
      return subscribers.length;
    } catch (error) {
      console.error('Failed to get subscriber count:', error);
      return 0;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Track subscription for analytics
   */
  private trackSubscription(email: string): void {
    // Google Analytics 4 example:
    if (typeof gtag !== 'undefined') {
      gtag('event', 'email_subscription', {
        event_category: 'engagement',
        event_label: 'waitlist',
        value: 1
      });
    }

    // Facebook Pixel example:
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: 'Email Waitlist',
        content_category: 'subscription'
      });
    }
    
    console.log('Subscription tracked for analytics');
  }

  /**
   * Switch email provider (useful for testing different services)
   */
  setProvider(provider: EmailProvider): void {
    this.provider = provider;
  }

  /**
   * Get admin service instance
   */
  getAdminService(): AdminEmailService {
    return new AdminEmailService();
  }
}

// Export singleton instance
export const EmailService = new EmailServiceClass();

// Export types and classes for use in other files
export type { EmailProvider, EmailSubscription, ApiResponse };
export { AdminEmailService, LaravelApiProvider, LocalStorageEmailProvider };