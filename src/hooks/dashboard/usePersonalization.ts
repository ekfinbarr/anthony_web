/**
 * Personalization Hook
 * Manages user personalization metrics, preferences, and behavior tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  PersonalizationMetrics, 
  ContentType,
  UserProfile 
} from '@/types/dashboard';
import { storageUtils } from '@/lib/dashboard-utils';

/**
 * Default personalization metrics
 */
const defaultMetrics: PersonalizationMetrics = {
  contentEngagement: {
    sermon: 0,
    event: 0,
    news: 0,
    ministry: 0,
    devotional: 0,
    prayer: 0
  },
  activityFrequency: {},
  timePreferences: {
    preferredDays: [0, 6], // Sunday and Saturday
    preferredTimes: ['09:00', '11:00', '19:00']
  },
  socialPreferences: {
    groupSize: 'medium',
    participationLevel: 'participant'
  }
};

/**
 * Personalization configuration
 */
interface PersonalizationConfig {
  enableTracking?: boolean;
  trackingInterval?: number;
  maxHistoryDays?: number;
}

/**
 * Personalization metrics hook
 */
export function usePersonalization(config: PersonalizationConfig = {}) {
  const {
    enableTracking = true,
    trackingInterval = 24 * 60 * 60 * 1000, // 24 hours
    maxHistoryDays = 90
  } = config;

  const [personalizationMetrics, setPersonalizationMetrics] = useState<PersonalizationMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Load personalization metrics from storage
   */
  const loadMetrics = useCallback(() => {
    try {
      const stored = localStorage.getItem('personalizationMetrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPersonalizationMetrics({ ...defaultMetrics, ...parsed });
        
        const lastUpdateStored = localStorage.getItem('personalizationLastUpdate');
        if (lastUpdateStored) {
          setLastUpdated(new Date(lastUpdateStored));
        }
      }
    } catch (error) {
      console.error('Failed to load personalization metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save personalization metrics to storage
   */
  const saveMetrics = useCallback((metrics: PersonalizationMetrics) => {
    try {
      localStorage.setItem('personalizationMetrics', JSON.stringify(metrics));
      localStorage.setItem('personalizationLastUpdate', new Date().toISOString());
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to save personalization metrics:', error);
    }
  }, []);

  /**
   * Initialize metrics on component mount
   */
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  /**
   * Update content engagement metrics
   */
  const updateEngagement = useCallback((
    contentType: ContentType,
    engagementType: 'view' | 'like' | 'share' | 'comment',
    weight: number = 1
  ) => {
    if (!enableTracking) return;

    setPersonalizationMetrics(prev => {
      const weights = {
        view: 1,
        like: 2,
        share: 3,
        comment: 2
      };

      const engagementWeight = weights[engagementType] * weight;
      
      const updated = {
        ...prev,
        contentEngagement: {
          ...prev.contentEngagement,
          [contentType]: prev.contentEngagement[contentType] + engagementWeight
        }
      };

      saveMetrics(updated);
      return updated;
    });
  }, [enableTracking, saveMetrics]);

  /**
   * Update activity frequency
   */
  const updateActivityFrequency = useCallback((
    activity: string,
    increment: number = 1
  ) => {
    if (!enableTracking) return;

    setPersonalizationMetrics(prev => {
      const updated = {
        ...prev,
        activityFrequency: {
          ...prev.activityFrequency,
          [activity]: (prev.activityFrequency[activity] || 0) + increment
        }
      };

      saveMetrics(updated);
      return updated;
    });
  }, [enableTracking, saveMetrics]);

  /**
   * Update time preferences based on user activity
   */
  const updateTimePreferences = useCallback((
    day: number,
    time: string
  ) => {
    if (!enableTracking) return;

    setPersonalizationMetrics(prev => {
      const preferredDays = [...prev.timePreferences.preferredDays];
      const preferredTimes = [...prev.timePreferences.preferredTimes];

      // Add day if not already preferred
      if (!preferredDays.includes(day)) {
        preferredDays.push(day);
        // Keep only top 3 preferred days
        if (preferredDays.length > 3) {
          preferredDays.shift();
        }
      }

      // Add time if not already preferred
      if (!preferredTimes.includes(time)) {
        preferredTimes.push(time);
        // Keep only top 5 preferred times
        if (preferredTimes.length > 5) {
          preferredTimes.shift();
        }
      }

      const updated = {
        ...prev,
        timePreferences: {
          preferredDays,
          preferredTimes
        }
      };

      saveMetrics(updated);
      return updated;
    });
  }, [enableTracking, saveMetrics]);

  /**
   * Update social preferences
   */
  const updateSocialPreferences = useCallback((
    groupSize?: 'small' | 'medium' | 'large',
    participationLevel?: 'observer' | 'participant' | 'leader'
  ) => {
    if (!enableTracking) return;

    setPersonalizationMetrics(prev => {
      const updated = {
        ...prev,
        socialPreferences: {
          groupSize: groupSize || prev.socialPreferences.groupSize,
          participationLevel: participationLevel || prev.socialPreferences.participationLevel
        }
      };

      saveMetrics(updated);
      return updated;
    });
  }, [enableTracking, saveMetrics]);

  /**
   * Get content preferences ranked by engagement
   */
  const getContentPreferences = useCallback(() => {
    const { contentEngagement } = personalizationMetrics;
    
    return Object.entries(contentEngagement)
      .sort(([, a], [, b]) => b - a)
      .map(([type, score]) => ({ type: type as ContentType, score }));
  }, [personalizationMetrics]);

  /**
   * Get activity preferences ranked by frequency
   */
  const getActivityPreferences = useCallback(() => {
    const { activityFrequency } = personalizationMetrics;
    
    return Object.entries(activityFrequency)
      .sort(([, a], [, b]) => b - a)
      .map(([activity, frequency]) => ({ activity, frequency }));
  }, [personalizationMetrics]);

  /**
   * Get personalization insights
   */
  const getPersonalizationInsights = useCallback(() => {
    const insights: string[] = [];
    
    // Content engagement insights
    const contentPreferences = getContentPreferences();
    if (contentPreferences.length > 0) {
      const topContent = contentPreferences[0];
      if (topContent.score > 10) {
        insights.push(`You engage most with ${topContent.type} content`);
      }
    }

    // Time preference insights
    const { preferredDays, preferredTimes } = personalizationMetrics.timePreferences;
    if (preferredDays.length > 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const topDay = dayNames[preferredDays[0]];
      insights.push(`You're most active on ${topDay}s`);
    }

    // Social preference insights
    const { groupSize, participationLevel } = personalizationMetrics.socialPreferences;
    insights.push(`You prefer ${groupSize} groups and tend to be a ${participationLevel}`);

    return insights;
  }, [personalizationMetrics, getContentPreferences]);

  /**
   * Reset personalization metrics
   */
  const resetMetrics = useCallback(() => {
    setPersonalizationMetrics(defaultMetrics);
    localStorage.removeItem('personalizationMetrics');
    localStorage.removeItem('personalizationLastUpdate');
    setLastUpdated(null);
  }, []);

  /**
   * Export personalization data
   */
  const exportData = useCallback(() => {
    return {
      metrics: personalizationMetrics,
      lastUpdated,
      insights: getPersonalizationInsights()
    };
  }, [personalizationMetrics, lastUpdated, getPersonalizationInsights]);

  /**
   * Import personalization data
   */
  const importData = useCallback((data: PersonalizationMetrics) => {
    setPersonalizationMetrics({ ...defaultMetrics, ...data });
    saveMetrics(data);
  }, [saveMetrics]);

  /**
   * Get engagement score for content type
   */
  const getEngagementScore = useCallback((contentType: ContentType): number => {
    return personalizationMetrics.contentEngagement[contentType] || 0;
  }, [personalizationMetrics]);

  /**
   * Get normalized engagement scores (0-1)
   */
  const getNormalizedEngagement = useCallback(() => {
    const { contentEngagement } = personalizationMetrics;
    const maxScore = Math.max(...Object.values(contentEngagement), 1);
    
    return Object.entries(contentEngagement).reduce((normalized, [type, score]) => {
      normalized[type as ContentType] = score / maxScore;
      return normalized;
    }, {} as Record<ContentType, number>);
  }, [personalizationMetrics]);

  /**
   * Track page visit
   */
  const trackPageVisit = useCallback((page: string, duration?: number) => {
    updateActivityFrequency(`page_${page}`, 1);
    
    if (duration) {
      updateActivityFrequency(`page_${page}_time`, duration);
    }

    // Update time preferences based on current time
    const now = new Date();
    const day = now.getDay();
    const time = now.toTimeString().slice(0, 5);
    updateTimePreferences(day, time);
  }, [updateActivityFrequency, updateTimePreferences]);

  /**
   * Track feature usage
   */
  type FeatureContext = {
    groupSize?: 'small' | 'medium' | 'large';
    participationLevel?: 'observer' | 'participant' | 'leader';
  } & Record<string, unknown>;

  const trackFeatureUsage = useCallback((feature: string, context?: FeatureContext) => {
    updateActivityFrequency(`feature_${feature}`, 1);
    
    if (context?.groupSize) {
      updateSocialPreferences(context.groupSize);
    }
    
    if (context?.participationLevel) {
      updateSocialPreferences(undefined, context.participationLevel);
    }
  }, [updateActivityFrequency, updateSocialPreferences]);

  /**
   * Get recommendation factors for AI
   */
  const getRecommendationFactors = useCallback(() => {
    const contentPreferences = getContentPreferences();
    const activityPreferences = getActivityPreferences();
    
    return {
      topContentTypes: contentPreferences.slice(0, 3).map(p => p.type),
      topActivities: activityPreferences.slice(0, 5).map(p => p.activity),
      timePreferences: personalizationMetrics.timePreferences,
      socialPreferences: personalizationMetrics.socialPreferences,
      totalEngagement: Object.values(personalizationMetrics.contentEngagement).reduce((a, b) => a + b, 0)
    };
  }, [getContentPreferences, getActivityPreferences, personalizationMetrics]);

  /**
   * Check if metrics need refresh
   */
  const needsRefresh = useCallback(() => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > trackingInterval;
  }, [lastUpdated, trackingInterval]);

  return {
    // State
    personalizationMetrics,
    isLoading,
    lastUpdated,
    
    // Actions
    updateEngagement,
    updateActivityFrequency,
    updateTimePreferences,
    updateSocialPreferences,
    trackPageVisit,
    trackFeatureUsage,
    
    // Getters
    getContentPreferences,
    getActivityPreferences,
    getPersonalizationInsights,
    getEngagementScore,
    getNormalizedEngagement,
    getRecommendationFactors,
    
    // Utilities
    resetMetrics,
    exportData,
    importData,
    needsRefresh,
    
    // Configuration
    enableTracking
  };
}