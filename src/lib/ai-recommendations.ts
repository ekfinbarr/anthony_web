/**
 * AI Recommendation Engine
 * Provides intelligent content recommendations, event suggestions, and community connections
 * Based on user behavior, preferences, and engagement patterns
 */

import { 
  ContentItem, 
  UserProfile, 
  AIRecommendation, 
  PersonalizationMetrics,
  CalendarEvent,
  CommunityConnection,
  ContentType,
  SpiritualGrowth
} from '@/types/dashboard';

/**
 * Main AI recommendation engine class
 */
export class AIRecommendationEngine {
  private readonly CONTENT_WEIGHTS = {
    recent_engagement: 0.3,
    interest_match: 0.25,
    trending: 0.2,
    diversity: 0.15,
    quality: 0.1
  };

  private readonly SPIRITUAL_GROWTH_WEIGHTS = {
    current_level: 0.3,
    goal_alignment: 0.25,
    activity_frequency: 0.2,
    improvement_potential: 0.15,
    peer_comparison: 0.1
  };

  /**
   * Generate personalized content recommendations
   */
  generateContentRecommendations(
    user: UserProfile,
    availableContent: ContentItem[],
    metrics: PersonalizationMetrics,
    limit: number = 10
  ): AIRecommendation[] {
    const scoredContent = this.scoreContentItems(user, availableContent, metrics);
    
    return scoredContent
      .slice(0, limit)
      .map(item => ({
        id: `content_${item.id}_${Date.now()}`,
        type: 'content' as const,
        title: `Recommended: ${item.title}`,
        description: this.generateContentRecommendationReason(item, user, metrics),
        confidence: Math.round(item.personalizedScore! * 100),
        reason: this.generateContentRecommendationReason(item, user, metrics),
        data: item,
        isActioned: false
      }));
  }

  /**
   * Score content items based on user preferences and behavior
   */
  private scoreContentItems(
    user: UserProfile,
    content: ContentItem[],
    metrics: PersonalizationMetrics
  ): ContentItem[] {
    return content
      .map(item => {
        const score = this.calculateContentScore(item, user, metrics);
        return { ...item, personalizedScore: score };
      })
      .sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
  }

  /**
   * Calculate content score using weighted factors
   */
  private calculateContentScore(
    item: ContentItem,
    user: UserProfile,
    metrics: PersonalizationMetrics
  ): number {
    const recentEngagementScore = this.calculateRecentEngagementScore(item.type, metrics);
    const interestMatchScore = this.calculateInterestMatchScore(item, user);
    const trendingScore = this.calculateTrendingScore(item);
    const diversityScore = this.calculateDiversityScore(item.type, metrics);
    const qualityScore = this.calculateQualityScore(item);

    return (
      recentEngagementScore * this.CONTENT_WEIGHTS.recent_engagement +
      interestMatchScore * this.CONTENT_WEIGHTS.interest_match +
      trendingScore * this.CONTENT_WEIGHTS.trending +
      diversityScore * this.CONTENT_WEIGHTS.diversity +
      qualityScore * this.CONTENT_WEIGHTS.quality
    );
  }

  /**
   * Score based on recent engagement with similar content types
   */
  private calculateRecentEngagementScore(
    contentType: ContentType,
    metrics: PersonalizationMetrics
  ): number {
    const engagement = metrics.contentEngagement[contentType] || 0;
    const maxEngagement = Math.max(...Object.values(metrics.contentEngagement));
    return maxEngagement > 0 ? engagement / maxEngagement : 0.5;
  }

  /**
   * Score based on how well content matches user interests
   */
  private calculateInterestMatchScore(item: ContentItem, user: UserProfile): number {
    const userInterests = user.interests.map(i => i.toLowerCase());
    const contentTags = item.tags.map(t => t.toLowerCase());
    
    const matches = userInterests.filter(interest => 
      contentTags.some(tag => tag.includes(interest) || interest.includes(tag))
    ).length;
    
    return userInterests.length > 0 ? matches / userInterests.length : 0.5;
  }

  /**
   * Score based on content popularity and engagement
   */
  private calculateTrendingScore(item: ContentItem): number {
    const { engagement } = item;
    const totalEngagement = engagement.views + engagement.likes + engagement.shares + engagement.comments;
    
    // Normalize based on content age (newer content gets boost)
    const daysSincePublish = Math.max(1, 
      (Date.now() - item.publishDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.min(1, totalEngagement / (daysSincePublish * 10));
  }

  /**
   * Encourage content diversity to avoid echo chambers
   */
  private calculateDiversityScore(
    contentType: ContentType,
    metrics: PersonalizationMetrics
  ): number {
    const typeEngagement = metrics.contentEngagement[contentType] || 0;
    const totalEngagement = Object.values(metrics.contentEngagement).reduce((a, b) => a + b, 0);
    
    if (totalEngagement === 0) return 1;
    
    const dominance = typeEngagement / totalEngagement;
    return Math.max(0, 1 - dominance); // Favor less consumed content types
  }

  /**
   * Score based on content quality indicators
   */
  private calculateQualityScore(item: ContentItem): number {
    const { engagement } = item;
    
    if (engagement.views === 0) return 0.5;
    
    const engagementRate = (engagement.likes + engagement.shares + engagement.comments) / engagement.views;
    return Math.min(1, engagementRate * 10); // Scale engagement rate
  }

  /**
   * Generate human-readable recommendation reason
   */
  private generateContentRecommendationReason(
    item: ContentItem,
    user: UserProfile,
    metrics: PersonalizationMetrics
  ): string {
    const reasons = [];
    
    // Interest match
    const matchingInterests = user.interests.filter(interest =>
      item.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    );
    if (matchingInterests.length > 0) {
      reasons.push(`matches your interests in ${matchingInterests.slice(0, 2).join(' and ')}`);
    }
    
    // Engagement pattern
    const typeEngagement = metrics.contentEngagement[item.type] || 0;
    if (typeEngagement > 0) {
      reasons.push(`you've been engaging with ${item.type} content recently`);
    }
    
    // Popularity
    if (item.engagement.views > 100) {
      reasons.push('popular with other members');
    }
    
    if (reasons.length === 0) {
      reasons.push('recommended for spiritual growth');
    }
    
    return `Recommended because ${reasons.join(', ')}.`;
  }

  /**
   * Generate spiritual growth recommendations
   */
  generateSpiritualGrowthRecommendations(
    user: UserProfile,
    growth: SpiritualGrowth
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Goal-based recommendations
    growth.goals.filter(goal => goal.isActive && goal.progress < 100).forEach(goal => {
      const suggestion = this.generateGoalRecommendation(goal, growth);
      if (suggestion) {
        recommendations.push(suggestion);
      }
    });
    
    // Streak maintenance recommendations
    growth.streaks.forEach(streak => {
      if (streak.currentStreak > 0) {
        const suggestion = this.generateStreakRecommendation(streak);
        if (suggestion) {
          recommendations.push(suggestion);
        }
      }
    });
    
    // Level progression recommendations
    const levelRecommendation = this.generateLevelProgressionRecommendation(growth);
    if (levelRecommendation) {
      recommendations.push(levelRecommendation);
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Generate goal-specific recommendations
   */
  private generateGoalRecommendation(
    goal: any,
    growth: SpiritualGrowth
  ): AIRecommendation | null {
    const daysUntilTarget = Math.ceil(
      (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilTarget <= 0) return null;
    
    const progressNeeded = 100 - goal.progress;
    const dailyProgressNeeded = progressNeeded / daysUntilTarget;
    
    return {
      id: `goal_${goal.id}_${Date.now()}`,
      type: 'goal',
      title: `Progress on "${goal.title}"`,
      description: `You need ${progressNeeded.toFixed(1)}% more progress in ${daysUntilTarget} days. Consider dedicating ${Math.ceil(dailyProgressNeeded * 10)} minutes daily.`,
      confidence: Math.min(95, 60 + (goal.progress / 2)),
      reason: `Goal deadline approaching with ${progressNeeded.toFixed(1)}% remaining`,
      data: { goal, dailyProgressNeeded },
      isActioned: false
    };
  }

  /**
   * Generate streak maintenance recommendations
   */
  private generateStreakRecommendation(streak: any): AIRecommendation | null {
    const daysSinceLastActivity = Math.ceil(
      (Date.now() - streak.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastActivity === 0) return null;
    
    const urgency = daysSinceLastActivity >= 1 ? 'high' : 'medium';
    
    return {
      id: `streak_${streak.type}_${Date.now()}`,
      type: 'activity',
      title: `Maintain your ${streak.type} streak`,
      description: `You have a ${streak.currentStreak}-day ${streak.type} streak. Don't break it now!`,
      confidence: 85,
      reason: `Active streak at risk (${streak.currentStreak} days)`,
      data: { streak, urgency },
      isActioned: false
    };
  }

  /**
   * Generate level progression recommendations
   */
  private generateLevelProgressionRecommendation(growth: SpiritualGrowth): AIRecommendation | null {
    const nextLevelPoints = (growth.currentLevel + 1) * 1000; // Assuming 1000 points per level
    const pointsNeeded = nextLevelPoints - growth.totalPoints;
    
    if (pointsNeeded <= 0) return null;
    
    return {
      id: `level_${growth.currentLevel}_${Date.now()}`,
      type: 'activity',
      title: 'Level Up Your Spiritual Journey',
      description: `You're ${pointsNeeded} points away from Level ${growth.currentLevel + 1}. Complete some activities to advance!`,
      confidence: 75,
      reason: `Close to next level (${pointsNeeded} points needed)`,
      data: { currentLevel: growth.currentLevel, pointsNeeded },
      isActioned: false
    };
  }

  /**
   * Generate community connection recommendations
   */
  generateCommunityRecommendations(
    user: UserProfile,
    availableConnections: CommunityConnection[],
    metrics: PersonalizationMetrics
  ): AIRecommendation[] {
    const scoredConnections = availableConnections
      .filter(connection => !connection.isJoined)
      .map(connection => ({
        ...connection,
        matchScore: this.calculateCommunityMatchScore(connection, user, metrics)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return scoredConnections.map(connection => ({
      id: `community_${connection.id}_${Date.now()}`,
      type: 'connection',
      title: `Join "${connection.title}"`,
      description: this.generateCommunityRecommendationReason(connection, user),
      confidence: Math.round(connection.matchScore),
      reason: this.generateCommunityRecommendationReason(connection, user),
      data: connection,
      isActioned: false
    }));
  }

  /**
   * Calculate community connection match score
   */
  private calculateCommunityMatchScore(
    connection: CommunityConnection,
    user: UserProfile,
    metrics: PersonalizationMetrics
  ): number {
    let score = 0;
    
    // Interest alignment
    const interestMatches = user.interests.filter(interest =>
      connection.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    ).length;
    score += (interestMatches / Math.max(1, user.interests.length)) * 40;
    
    // Ministry involvement
    if (user.ministries.includes(connection.type)) {
      score += 30;
    }
    
    // Group size preference
    const sizePreference = metrics.socialPreferences.groupSize;
    const connectionSize = connection.memberCount;
    
    if (
      (sizePreference === 'small' && connectionSize <= 15) ||
      (sizePreference === 'medium' && connectionSize > 15 && connectionSize <= 50) ||
      (sizePreference === 'large' && connectionSize > 50)
    ) {
      score += 20;
    }
    
    // Existing match score from the connection itself
    score += connection.matchScore * 0.1;
    
    return Math.min(100, score);
  }

  /**
   * Generate community recommendation reason
   */
  private generateCommunityRecommendationReason(
    connection: CommunityConnection,
    user: UserProfile
  ): string {
    const reasons = [];
    
    const matchingInterests = user.interests.filter(interest =>
      connection.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    );
    
    if (matchingInterests.length > 0) {
      reasons.push(`aligns with your interests in ${matchingInterests.slice(0, 2).join(' and ')}`);
    }
    
    if (user.ministries.includes(connection.type)) {
      reasons.push(`matches your ministry involvement`);
    }
    
    if (connection.memberCount <= 15) {
      reasons.push('small group setting for close fellowship');
    }
    
    if (reasons.length === 0) {
      reasons.push('good fit for your spiritual journey');
    }
    
    return `Recommended because it ${reasons.join(', ')}.`;
  }

  /**
   * Generate calendar-based event recommendations
   */
  generateEventRecommendations(
    user: UserProfile,
    upcomingEvents: CalendarEvent[],
    userCalendar: CalendarEvent[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Find events that match user interests but aren't attended yet
    const unattendedEvents = upcomingEvents.filter(event => 
      !userCalendar.some(userEvent => userEvent.id === event.id)
    );
    
    const scoredEvents = unattendedEvents
      .map(event => ({
        ...event,
        relevanceScore: this.calculateEventRelevanceScore(event, user)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
    
    return scoredEvents.map(event => ({
      id: `event_${event.id}_${Date.now()}`,
      type: 'event',
      title: `Don't miss: ${event.title}`,
      description: `This event matches your interests and fits your schedule.`,
      confidence: Math.round(event.relevanceScore),
      reason: `Relevant to your interests and available on your calendar`,
      data: event,
      isActioned: false
    }));
  }

  /**
   * Calculate event relevance score
   */
  private calculateEventRelevanceScore(event: CalendarEvent, user: UserProfile): number {
    let score = 50; // Base score
    
    // Check if event type matches user interests
    if (user.interests.some(interest => 
      event.title.toLowerCase().includes(interest.toLowerCase()) ||
      event.description.toLowerCase().includes(interest.toLowerCase())
    )) {
      score += 30;
    }
    
    // Prefer events in user's ministries
    if (user.ministries.includes(event.type)) {
      score += 20;
    }
    
    return Math.min(100, score);
  }
}

/**
 * Utility functions for AI recommendations
 */
export const aiRecommendationUtils = {
  /**
   * Filter recommendations by confidence threshold
   */
  filterByConfidence: (
    recommendations: AIRecommendation[], 
    minConfidence: number = 70
  ): AIRecommendation[] => {
    return recommendations.filter(rec => rec.confidence >= minConfidence);
  },

  /**
   * Group recommendations by type
   */
  groupByType: (recommendations: AIRecommendation[]): Record<string, AIRecommendation[]> => {
    return recommendations.reduce((groups, recommendation) => {
      const type = recommendation.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(recommendation);
      return groups;
    }, {} as Record<string, AIRecommendation[]>);
  },

  /**
   * Get top recommendations across all types
   */
  getTopRecommendations: (
    recommendations: AIRecommendation[], 
    limit: number = 5
  ): AIRecommendation[] => {
    return [...recommendations]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  },

  /**
   * Check if recommendation is expired
   */
  isExpired: (recommendation: AIRecommendation): boolean => {
    if (!recommendation.expiresAt) return false;
    return new Date() > recommendation.expiresAt;
  },

  /**
   * Remove expired recommendations
   */
  removeExpired: (recommendations: AIRecommendation[]): AIRecommendation[] => {
    return recommendations.filter(rec => !aiRecommendationUtils.isExpired(rec));
  }
};

// Export singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine();