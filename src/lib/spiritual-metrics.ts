/**
 * Spiritual Metrics and Growth Tracking Utilities
 * Handles spiritual growth calculations, progress tracking, and achievements
 */

import { 
  SpiritualGrowth,
  SpiritualActivity,
  SpiritualGoal,
  SpiritualStreak,
  Achievement,
  ProgressSnapshot,
  UserProfile
} from '@/types/dashboard';

/**
 * Spiritual growth metrics calculator
 */
export class SpiritualMetricsCalculator {
  private readonly ACTIVITY_POINTS = {
    prayer: 10,
    reading: 15,
    service: 25,
    attendance: 20,
    donation: 30,
    ministry: 35
  };

  private readonly LEVEL_THRESHOLDS = [
    0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000
  ];

  private readonly ACHIEVEMENTS_CONFIG = [
    {
      id: 'first_prayer',
      title: 'First Prayer',
      description: 'Logged your first prayer session',
      category: 'prayer',
      points: 50,
      condition: (activities: SpiritualActivity[]) => 
        activities.some(a => a.type === 'prayer')
    },
    {
      id: 'prayer_warrior',
      title: 'Prayer Warrior',
      description: 'Prayed for 30 consecutive days',
      category: 'prayer',
      points: 200,
      condition: (activities: SpiritualActivity[], streaks: SpiritualStreak[]) => 
        streaks.find(s => s.type === 'prayer')?.currentStreak >= 30
    },
    {
      id: 'faithful_reader',
      title: 'Faithful Reader',
      description: 'Read Scripture for 7 consecutive days',
      category: 'reading',
      points: 100,
      condition: (activities: SpiritualActivity[], streaks: SpiritualStreak[]) => 
        streaks.find(s => s.type === 'reading')?.currentStreak >= 7
    },
    {
      id: 'servant_heart',
      title: 'Servant Heart',
      description: 'Completed 10 service activities',
      category: 'service',
      points: 150,
      condition: (activities: SpiritualActivity[]) => 
        activities.filter(a => a.type === 'service').length >= 10
    },
    {
      id: 'faithful_attendee',
      title: 'Faithful Attendee',
      description: 'Attended church for 4 consecutive weeks',
      category: 'attendance',
      points: 120,
      condition: (activities: SpiritualActivity[], streaks: SpiritualStreak[]) => 
        streaks.find(s => s.type === 'attendance')?.currentStreak >= 4
    },
    {
      id: 'generous_giver',
      title: 'Generous Giver',
      description: 'Made 5 donations',
      category: 'donation',
      points: 180,
      condition: (activities: SpiritualActivity[]) => 
        activities.filter(a => a.type === 'donation').length >= 5
    },
    {
      id: 'ministry_leader',
      title: 'Ministry Leader',
      description: 'Active in ministry for 3 months',
      category: 'ministry',
      points: 300,
      condition: (activities: SpiritualActivity[]) => {
        const ministryActivities = activities.filter(a => a.type === 'ministry');
        if (ministryActivities.length === 0) return false;
        
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        return ministryActivities.some(a => a.date <= threeMonthsAgo);
      }
    }
  ];

  /**
   * Calculate current spiritual level based on total points
   */
  calculateLevel(totalPoints: number): number {
    for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= this.LEVEL_THRESHOLDS[i]) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Calculate points needed for next level
   */
  getPointsToNextLevel(totalPoints: number): number {
    const currentLevel = this.calculateLevel(totalPoints);
    const nextLevelThreshold = this.LEVEL_THRESHOLDS[currentLevel + 1];
    
    if (!nextLevelThreshold) return 0; // Max level reached
    
    return nextLevelThreshold - totalPoints;
  }

  /**
   * Calculate progress percentage to next level
   */
  getLevelProgress(totalPoints: number): number {
    const currentLevel = this.calculateLevel(totalPoints);
    const currentThreshold = this.LEVEL_THRESHOLDS[currentLevel];
    const nextThreshold = this.LEVEL_THRESHOLDS[currentLevel + 1];
    
    if (!nextThreshold) return 100; // Max level reached
    
    const progressPoints = totalPoints - currentThreshold;
    const levelRange = nextThreshold - currentThreshold;
    
    return Math.round((progressPoints / levelRange) * 100);
  }

  /**
   * Calculate total points from activities
   */
  calculateTotalPoints(activities: SpiritualActivity[]): number {
    return activities
      .filter(activity => activity.verified)
      .reduce((total, activity) => total + activity.points, 0);
  }

  /**
   * Calculate streak for a specific activity type
   */
  calculateStreak(activities: SpiritualActivity[], type: SpiritualActivity['type']): SpiritualStreak {
    const typeActivities = activities
      .filter(a => a.type === type && a.verified)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (typeActivities.length === 0) {
      return {
        type,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date()
      };
    }

    const lastActivity = typeActivities[0].date;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from most recent activity backwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    let foundActivity = false;

    for (let i = 0; i < 365; i++) { // Check up to a year back
      const hasActivityOnDate = typeActivities.some(activity => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === checkDate.getTime();
      });

      if (hasActivityOnDate) {
        currentStreak++;
        foundActivity = true;
      } else if (foundActivity) {
        break; // Streak is broken
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    const activityDates = typeActivities.map(a => {
      const date = new Date(a.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = [...new Set(activityDates)].sort((a, b) => b - a);

    for (let i = 0; i < uniqueDates.length; i++) {
      tempStreak = 1;
      
      for (let j = i + 1; j < uniqueDates.length; j++) {
        const daysDiff = (uniqueDates[j - 1] - uniqueDates[j]) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          break;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      type,
      currentStreak,
      longestStreak,
      lastActivity
    };
  }

  /**
   * Calculate all streaks for a user
   */
  calculateAllStreaks(activities: SpiritualActivity[]): SpiritualStreak[] {
    const types: SpiritualActivity['type'][] = ['prayer', 'reading', 'service', 'attendance'];
    return types.map(type => this.calculateStreak(activities, type));
  }

  /**
   * Check for new achievements
   */
  checkForNewAchievements(
    activities: SpiritualActivity[],
    streaks: SpiritualStreak[],
    existingAchievements: Achievement[]
  ): Achievement[] {
    const newAchievements: Achievement[] = [];
    const existingIds = new Set(existingAchievements.map(a => a.id));

    for (const config of this.ACHIEVEMENTS_CONFIG) {
      if (!existingIds.has(config.id) && config.condition(activities, streaks)) {
        newAchievements.push({
          id: config.id,
          title: config.title,
          description: config.description,
          badgeIcon: this.getBadgeIcon(config.category),
          earnedDate: new Date(),
          category: config.category,
          points: config.points
        });
      }
    }

    return newAchievements;
  }

  /**
   * Get badge icon for achievement category
   */
  private getBadgeIcon(category: string): string {
    const icons = {
      prayer: '🙏',
      reading: '📖',
      service: '🤝',
      attendance: '⛪',
      donation: '💝',
      ministry: '👑'
    };
    return icons[category as keyof typeof icons] || '🏆';
  }

  /**
   * Calculate goal progress based on activities
   */
  calculateGoalProgress(goal: SpiritualGoal, activities: SpiritualActivity[]): number {
    const relevantActivities = activities.filter(activity => 
      activity.type === goal.category && 
      activity.date >= new Date(goal.id) && // Assuming goal.id contains creation timestamp
      activity.verified
    );

    // This is a simplified calculation - in a real app, you'd have more specific logic per goal type
    const activityCount = relevantActivities.length;
    const targetCount = goal.milestones.reduce((sum, milestone) => sum + milestone.targetValue, 0);
    
    return Math.min(100, (activityCount / Math.max(1, targetCount)) * 100);
  }

  /**
   * Update goal milestones based on activities
   */
  updateGoalMilestones(goal: SpiritualGoal, activities: SpiritualActivity[]): SpiritualGoal {
    const updatedMilestones = goal.milestones.map(milestone => {
      const relevantActivities = activities.filter(activity => 
        activity.type === goal.category && 
        activity.date >= new Date(goal.id) &&
        activity.verified
      );

      const currentValue = relevantActivities.length; // Simplified logic
      const completed = currentValue >= milestone.targetValue;

      return {
        ...milestone,
        currentValue,
        completed,
        completedDate: completed && !milestone.completed ? new Date() : milestone.completedDate
      };
    });

    const progress = this.calculateGoalProgress(goal, activities);

    return {
      ...goal,
      milestones: updatedMilestones,
      progress
    };
  }

  /**
   * Create progress snapshot for historical tracking
   */
  createProgressSnapshot(
    totalPoints: number,
    activities: SpiritualActivity[],
    goals: SpiritualGoal[]
  ): ProgressSnapshot {
    const level = this.calculateLevel(totalPoints);
    const activitiesCount = activities.filter(a => a.verified).length;
    
    const goalsProgress = goals.reduce((progress, goal) => {
      progress[goal.id] = goal.progress;
      return progress;
    }, {} as Record<string, number>);

    return {
      date: new Date(),
      totalPoints,
      level,
      activitiesCount,
      goalsProgress
    };
  }

  /**
   * Get spiritual growth insights
   */
  getGrowthInsights(growth: SpiritualGrowth): string[] {
    const insights: string[] = [];
    
    // Activity frequency insights
    const recentActivities = growth.activities.filter(activity => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return activity.date >= sevenDaysAgo;
    });

    if (recentActivities.length === 0) {
      insights.push("You haven't logged any spiritual activities this week. Consider starting with a simple prayer or scripture reading.");
    } else if (recentActivities.length >= 5) {
      insights.push("Great job staying spiritually active this week! You've logged multiple activities.");
    }

    // Streak insights
    const activeStreaks = growth.streaks.filter(streak => streak.currentStreak > 0);
    if (activeStreaks.length > 0) {
      const longestStreak = Math.max(...activeStreaks.map(s => s.currentStreak));
      insights.push(`You're on a ${longestStreak}-day streak! Keep it up to build lasting spiritual habits.`);
    }

    // Goal progress insights
    const activeGoals = growth.goals.filter(goal => goal.isActive);
    const strugglingGoals = activeGoals.filter(goal => goal.progress < 25);
    if (strugglingGoals.length > 0) {
      insights.push(`${strugglingGoals.length} of your goals need attention. Consider breaking them into smaller steps.`);
    }

    // Level progression insights
    const pointsToNext = this.getPointsToNextLevel(growth.totalPoints);
    if (pointsToNext > 0 && pointsToNext <= 100) {
      insights.push(`You're only ${pointsToNext} points away from the next level! Complete a few more activities to advance.`);
    }

    return insights;
  }

  /**
   * Get recommended next actions
   */
  getRecommendedActions(growth: SpiritualGrowth): string[] {
    const actions: string[] = [];
    
    // Check for broken streaks
    const brokenStreaks = growth.streaks.filter(streak => {
      // Ensure lastActivity is a Date object
      const lastActivity = streak.lastActivity instanceof Date 
        ? streak.lastActivity 
        : new Date(streak.lastActivity);
      
      // Check if date is valid
      if (isNaN(lastActivity.getTime())) {
        console.warn('Invalid lastActivity date for streak:', streak);
        return false;
      }
      
      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      return streak.currentStreak === 0 && daysSinceLastActivity <= 3;
    });

    if (brokenStreaks.length > 0) {
      actions.push(`Restart your ${brokenStreaks[0].type} habit - you can build back your streak!`);
    }

    // Check for stalled goals
    const stalledGoals = growth.goals.filter(goal => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(goal.id).getTime()) / (1000 * 60 * 60 * 24)
      );
      return goal.isActive && goal.progress < 50 && daysSinceUpdate > 7;
    });

    if (stalledGoals.length > 0) {
      actions.push(`Work on your "${stalledGoals[0].title}" goal - it's been inactive for a while.`);
    }

    // Suggest new activities based on low activity types
    const activityCounts = this.ACTIVITY_POINTS;
    const userActivityCounts = Object.keys(activityCounts).reduce((counts, type) => {
      counts[type] = growth.activities.filter(a => a.type === type as any).length;
      return counts;
    }, {} as Record<string, number>);

    const leastActiveType = Object.entries(userActivityCounts)
      .sort(([,a], [,b]) => a - b)[0];

    if (leastActiveType && leastActiveType[1] < 3) {
      const typeNames = {
        prayer: 'prayer session',
        reading: 'scripture reading',
        service: 'community service',
        attendance: 'church service',
        donation: 'charitable giving',
        ministry: 'ministry involvement'
      };
      
      actions.push(`Try adding a ${typeNames[leastActiveType[0] as keyof typeof typeNames]} to diversify your spiritual practices.`);
    }

    return actions.slice(0, 3); // Limit to top 3 actions
  }
}

/**
 * Utility functions for spiritual metrics
 */
export const spiritualMetricsUtils = {
  /**
   * Format points with appropriate suffix
   */
  formatPoints: (points: number): string => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k`;
    }
    return points.toString();
  },

  /**
   * Get level title based on level number
   */
  getLevelTitle: (level: number): string => {
    const titles = [
      'Seeker', 'Believer', 'Faithful', 'Devoted', 'Committed', 
      'Dedicated', 'Servant', 'Minister', 'Leader', 'Elder', 
      'Wise', 'Spiritual Guide', 'Master'
    ];
    return titles[Math.min(level, titles.length - 1)] || 'Spiritual Master';
  },

  /**
   * Get streak emoji based on length
   */
  getStreakEmoji: (streakLength: number): string => {
    if (streakLength >= 30) return '🔥';
    if (streakLength >= 14) return '⚡';
    if (streakLength >= 7) return '✨';
    if (streakLength >= 3) return '🌟';
    return '💫';
  },

  /**
   * Calculate weekly activity distribution
   */
  getWeeklyDistribution: (activities: SpiritualActivity[]): Record<string, number> => {
    const weeklyData = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0,
      Friday: 0, Saturday: 0, Sunday: 0
    };

    activities.forEach(activity => {
      const dayName = activity.date.toLocaleDateString('en-US', { weekday: 'long' });
      if (weeklyData.hasOwnProperty(dayName)) {
        weeklyData[dayName as keyof typeof weeklyData]++;
      }
    });

    return weeklyData;
  },

  /**
   * Calculate monthly progress
   */
  getMonthlyProgress: (activities: SpiritualActivity[]): Record<string, number> => {
    const monthlyData: Record<string, number> = {};
    
    activities.forEach(activity => {
      const monthKey = activity.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + activity.points;
    });

    return monthlyData;
  }
};

// Export singleton instance
export const spiritualMetricsCalculator = new SpiritualMetricsCalculator();