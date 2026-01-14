/**
 * Dashboard Utility Functions
 * Provides common utilities for dashboard operations, data management, and UI helpers
 */

import { 
  DashboardData,
  UserProfile,
  ContentItem,
  CalendarEvent,
  CalendarConflict,
  SpiritualGrowth,
  FilterOptions,
  SortOptions,
  TimeRange,
  ContentType,
  EventType
} from '@/types/dashboard';

/**
 * Calendar utility functions
 */
export const calendarUtils = {
  /**
   * Detect conflicts between calendar events
   */
  detectConflicts: (events: CalendarEvent[]): CalendarConflict[] => {
    const conflicts: CalendarConflict[] = [];
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const conflictingEvents: CalendarEvent[] = [];
      
      for (let j = i + 1; j < events.length; j++) {
        const otherEvent = events[j];
        
        if (calendarUtils.eventsOverlap(event, otherEvent)) {
          conflictingEvents.push(otherEvent);
        }
      }
      
      if (conflictingEvents.length > 0) {
        conflicts.push({
          eventId: event.id,
          conflictingEvents,
          severity: calendarUtils.getConflictSeverity(event, conflictingEvents),
          suggestions: calendarUtils.generateConflictSuggestions(event, conflictingEvents)
        });
      }
    }
    
    return conflicts;
  },

  /**
   * Check if two events overlap
   */
  eventsOverlap: (event1: CalendarEvent, event2: CalendarEvent): boolean => {
    return event1.startDate < event2.endDate && event2.startDate < event1.endDate;
  },

  /**
   * Determine conflict severity
   */
  getConflictSeverity: (event: CalendarEvent, conflictingEvents: CalendarEvent[]): 'low' | 'medium' | 'high' => {
    const importantTypes: EventType[] = ['mass', 'ministry'];
    
    const isMainEventImportant = importantTypes.includes(event.type);
    const hasImportantConflicts = conflictingEvents.some(e => importantTypes.includes(e.type));
    
    if (isMainEventImportant && hasImportantConflicts) return 'high';
    if (isMainEventImportant || hasImportantConflicts) return 'medium';
    return 'low';
  },

  /**
   * Generate suggestions for resolving conflicts
   */
  generateConflictSuggestions: (event: CalendarEvent, conflictingEvents: CalendarEvent[]): string[] => {
    const suggestions: string[] = [];
    
    if (event.type === 'personal') {
      suggestions.push('Consider rescheduling your personal event');
    }
    
    if (conflictingEvents.some(e => e.type === 'social')) {
      suggestions.push('Social events may be more flexible to reschedule');
    }
    
    suggestions.push('Contact organizers to discuss alternatives');
    suggestions.push('Check if events can be attended partially');
    
    return suggestions;
  },

  /**
   * Format event duration
   */
  formatDuration: (startDate: Date, endDate: Date): string => {
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  },

  /**
   * Get events for a specific date range
   */
  getEventsInRange: (events: CalendarEvent[], range: TimeRange): CalendarEvent[] => {
    return events.filter(event => 
      event.startDate >= range.start && event.startDate <= range.end
    );
  },

  /**
   * Get upcoming events (next 7 days)
   */
  getUpcomingEvents: (events: CalendarEvent[], limit: number = 5): CalendarEvent[] => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    return events
      .filter(event => event.startDate >= now && event.startDate <= sevenDaysLater)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);
  },

  /**
   * Group events by date
   */
  groupEventsByDate: (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
    return events.reduce((groups, event) => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);
  }
};

/**
 * Content filtering and sorting utilities
 */
export const contentUtils = {
  /**
   * Filter content based on options
   */
  filterContent: (content: ContentItem[], filters: FilterOptions): ContentItem[] => {
    let filtered = [...content];
    
    if (filters.contentTypes && filters.contentTypes.length > 0) {
      filtered = filtered.filter(item => filters.contentTypes!.includes(item.type));
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags.some(tag => 
          filters.tags!.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(item => 
        item.publishDate >= filters.dateRange!.start && 
        item.publishDate <= filters.dateRange!.end
      );
    }
    
    return filtered;
  },

  /**
   * Sort content based on options
   */
  sortContent: (content: ContentItem[], sortOptions: SortOptions): ContentItem[] => {
    const sorted = [...content];
    
    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;
      
      switch (sortOptions.field) {
        case 'publishDate':
          aValue = a.publishDate.getTime();
          bValue = b.publishDate.getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'engagement':
          aValue = a.engagement.views + a.engagement.likes + a.engagement.shares;
          bValue = b.engagement.views + b.engagement.likes + b.engagement.shares;
          break;
        case 'personalizedScore':
          aValue = a.personalizedScore || 0;
          bValue = b.personalizedScore || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  },

  /**
   * Get trending content based on engagement
   */
  getTrendingContent: (content: ContentItem[], limit: number = 5): ContentItem[] => {
    return content
      .map(item => ({
        ...item,
        trendingScore: contentUtils.calculateTrendingScore(item)
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  },

  /**
   * Calculate trending score for content
   */
  calculateTrendingScore: (item: ContentItem): number => {
    const { engagement } = item;
    const totalEngagement = engagement.views + engagement.likes * 2 + engagement.shares * 3 + engagement.comments * 2;
    
    // Factor in recency (newer content gets boost)
    const daysSincePublish = Math.max(1, 
      (Date.now() - item.publishDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return totalEngagement / Math.log(daysSincePublish + 1);
  },

  /**
   * Get content recommendations based on user interaction
   */
  getPersonalizedContent: (
    content: ContentItem[],
    userInterests: string[],
    limit: number = 10
  ): ContentItem[] => {
    return content
      .map(item => ({
        ...item,
        relevanceScore: contentUtils.calculateRelevanceScore(item, userInterests)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  },

  /**
   * Calculate content relevance score
   */
  calculateRelevanceScore: (item: ContentItem, userInterests: string[]): number => {
    let score = 0;
    
    // Check tag matches
    const tagMatches = item.tags.filter(tag =>
      userInterests.some(interest => 
        tag.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(tag.toLowerCase())
      )
    ).length;
    
    score += tagMatches * 10;
    
    // Check title/description matches
    const titleMatches = userInterests.filter(interest =>
      item.title.toLowerCase().includes(interest.toLowerCase()) ||
      item.description.toLowerCase().includes(interest.toLowerCase())
    ).length;
    
    score += titleMatches * 5;
    
    // Factor in engagement
    score += Math.log(item.engagement.views + 1);
    
    return score;
  }
};

/**
 * Data validation utilities
 */
export const dataValidation = {
  /**
   * Validate user profile data
   */
  validateUserProfile: (profile: Partial<UserProfile>): string[] => {
    const errors: string[] = [];
    
    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!profile.email || !dataValidation.isValidEmail(profile.email)) {
      errors.push('Valid email is required');
    }
    
    return errors;
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate date range
   */
  isValidDateRange: (range: TimeRange): boolean => {
    return range.start <= range.end;
  },

  /**
   * Sanitize user input
   */
  sanitizeInput: (input: string): string => {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
};

/**
 * Local storage utilities for dashboard data
 */
export const storageUtils = {
  /**
   * Save dashboard data to local storage
   */
  saveDashboardData: (data: Partial<DashboardData>): void => {
    try {
      const existing = storageUtils.loadDashboardData();
      const updated = { ...existing, ...data };
      localStorage.setItem('dashboardData', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save dashboard data:', error);
    }
  },

  /**
   * Load dashboard data from local storage
   */
  loadDashboardData: (): Partial<DashboardData> => {
    try {
      const stored = localStorage.getItem('dashboardData');
      if (stored) {
        const parsed = JSON.parse(stored, storageUtils.dateReviver);
        const converted = storageUtils.ensureDatesAreConverted(parsed);
        
        // Validate that critical date fields are proper Date objects
        if (converted.spiritualGrowth?.streaks) {
          for (const streak of converted.spiritualGrowth.streaks) {
            if (!(streak.lastActivity instanceof Date) || isNaN(streak.lastActivity.getTime())) {
              console.warn('Invalid streak data detected, clearing localStorage');
              storageUtils.clearDashboardData();
              return {};
            }
          }
        }
        
        return converted;
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      console.warn('Clearing corrupted localStorage data');
      storageUtils.clearDashboardData();
    }
    return {};
  },

  /**
   * Clear dashboard data from local storage
   */
  clearDashboardData: (): void => {
    try {
      localStorage.removeItem('dashboardData');
    } catch (error) {
      console.error('Failed to clear dashboard data:', error);
    }
  },

  /**
   * Date reviver for JSON parsing
   */
  dateReviver: (key: string, value: unknown): unknown => {
    // Check for ISO date strings
    if (typeof value === 'string') {
      // More comprehensive date pattern matching
      const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      const simpleIsoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      
      if (isoDatePattern.test(value) || simpleIsoPattern.test(value)) {
        const date = new Date(value);
        // Verify it's a valid date
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return value;
  },

  /**
   * Ensure all date fields are properly converted to Date objects
   */
  ensureDatesAreConverted: (data: unknown): unknown => {
    if (!data) return data;
    
    // Recursively convert date strings to Date objects
    const convertDates = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'string') {
        // Try to parse as date
        const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        if (isoDatePattern.test(obj)) {
          const date = new Date(obj);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(convertDates);
      }
      
      if (typeof obj === 'object') {
        const converted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          // Special handling for known date fields
          if (key.includes('Date') || key.includes('date') || 
              key === 'lastActivity' || key === 'publishDate' || 
              key === 'earnedDate' || key === 'completedDate' ||
              key === 'targetDate' || key === 'startDate' || key === 'endDate') {
            if (typeof value === 'string') {
              const date = new Date(value);
              converted[key] = !isNaN(date.getTime()) ? date : value;
            } else {
              converted[key] = value;
            }
          } else {
            converted[key] = convertDates(value);
          }
        }
        return converted;
      }
      
      return obj;
    };
    
    return convertDates(data);
  },

  /**
   * Save user preferences
   */
  saveUserPreferences: (preferences: unknown): void => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  },

  /**
   * Load user preferences
   */
  loadUserPreferences: (): unknown => {
    try {
      const stored = localStorage.getItem('userPreferences');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {};
    }
  }
};

/**
 * UI helper utilities
 */
export const uiUtils = {
  /**
   * Format date for display
   */
  formatDate: (date: Date, format: 'short' | 'long' | 'time' = 'short'): string => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (format) {
      case 'short':
        options.month = 'short';
        options.day = 'numeric';
        break;
      case 'long':
        options.weekday = 'long';
        options.month = 'long';
        options.day = 'numeric';
        options.year = 'numeric';
        break;
      case 'time':
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.hour12 = true;
        break;
    }
    
    return date.toLocaleDateString('en-US', options);
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return uiUtils.formatDate(date, 'short');
  },

  /**
   * Get avatar initials from name
   */
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  },

  /**
   * Generate random avatar color
   */
  getAvatarColor: (name: string): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  },

  /**
   * Truncate text with ellipsis
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },

  /**
   * Format number with appropriate suffix (K, M, etc.)
   */
  formatNumber: (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },

  /**
   * Get engagement icon based on type
   */
  getEngagementIcon: (type: 'view' | 'like' | 'share' | 'comment'): string => {
    const icons = {
      view: '👁️',
      like: '❤️',
      share: '🔄',
      comment: '💬'
    };
    return icons[type];
  }
};

/**
 * Mock data generators for development and testing
 */
export const mockDataUtils = {
  /**
   * Generate mock user profile
   */
  generateMockUser: (): UserProfile => ({
    id: 'user_123',
    name: 'John Doe',
    email: 'john.doe@email.com',
    avatar: undefined,
    joinDate: new Date('2023-01-15'),
    interests: ['prayer', 'community service', 'bible study', 'youth ministry'],
    ministries: ['youth', 'music'],
    preferences: {
      contentTypes: ['sermon', 'devotional', 'prayer'],
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: false,
        reminderSettings: {
          events: true,
          prayers: true,
          reading: true
        }
      },
      calendarSettings: {
        defaultView: 'week',
        timeZone: 'America/New_York',
        syncExternalCalendars: false
      },
      privacySettings: {
        showActivityStatus: true,
        shareGrowthProgress: true,
        allowRecommendations: true
      }
    }
  }),

  /**
   * Generate mock content items
   */
  generateMockContent: (count: number = 10): ContentItem[] => {
    const types: ContentType[] = ['sermon', 'devotional', 'news', 'event'];
    const titles = [
      'Finding Peace in Troubled Times',
      'The Power of Community Prayer',
      'Serving Others with Joy',
      'Walking in Faith Daily',
      'Christmas Celebration 2024'
    ];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `content_${i + 1}`,
      type: types[i % types.length],
      title: titles[i % titles.length],
      description: `This is a meaningful content piece about spiritual growth and community.`,
      author: 'Pastor Smith',
      publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      tags: ['faith', 'community', 'prayer'],
      category: 'Spiritual Growth',
      engagement: {
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 25),
        userEngaged: Math.random() > 0.5
      }
    }));
  },

  /**
   * Generate mock calendar events
   */
  generateMockEvents: (count: number = 5): CalendarEvent[] => {
    const types: EventType[] = ['mass', 'meeting', 'social', 'service'];
    const titles = [
      'Sunday Morning Mass',
      'Prayer Group Meeting',
      'Community Service Day',
      'Youth Group Social',
      'Bible Study Session'
    ];
    
    return Array.from({ length: count }, (_, i) => {
      const startDate = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      return {
        id: `event_${i + 1}`,
        title: titles[i % titles.length],
        description: 'Join us for this meaningful gathering.',
        startDate,
        endDate,
        location: 'St. Anthony Church',
        type: types[i % types.length],
        organizer: 'Church Staff',
        isRecurring: false,
        reminderSettings: {
          enabled: true,
          reminderTimes: [15, 60] // 15 min and 1 hour before
        },
        rsvpStatus: 'pending'
      };
    });
  }
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Measure function execution time
   */
  measureTime: <T>(fn: () => T, label: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }
};