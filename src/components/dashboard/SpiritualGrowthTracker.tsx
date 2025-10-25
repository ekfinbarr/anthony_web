/**
 * Spiritual Growth Tracker Component
 * Displays spiritual progress, goals, achievements, and recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Target, Trophy, TrendingUp, Plus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { SpiritualGrowth, AIRecommendation } from '@/types/dashboard';
import { spiritualMetricsUtils } from '@/lib/spiritual-metrics';

interface SpiritualGrowthTrackerProps {
  spiritualGrowth: SpiritualGrowth | null;
  recommendations: AIRecommendation[];
  onActivityAdd: (activity: any) => Promise<any>;
  onGoalAdd: (goal: any) => Promise<any>;
  onFeatureClick: (feature: string, context?: Record<string, any>) => void;
  isLoading: boolean;
}

export default function SpiritualGrowthTracker({
  spiritualGrowth,
  recommendations,
  onActivityAdd,
  onGoalAdd,
  onFeatureClick,
  isLoading
}: SpiritualGrowthTrackerProps) {
  if (!spiritualGrowth) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Loading spiritual growth data...</p>
      </div>
    );
  }

  const levelTitle = spiritualMetricsUtils.getLevelTitle(spiritualGrowth.currentLevel);
  const activeGoals = spiritualGrowth.goals.filter(goal => goal.isActive);
  const recentAchievements = spiritualGrowth.achievements.slice(-3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Spiritual Growth</h2>
          <p className="text-muted-foreground">
            Track your spiritual journey and achievements
          </p>
        </div>
        <Button onClick={() => onFeatureClick('add_activity')}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {spiritualGrowth.currentLevel}
              </div>
              <Badge variant="secondary">{levelTitle}</Badge>
              <Progress value={75} className="mt-4" />
              <p className="text-sm text-muted-foreground mt-2">
                {spiritualMetricsUtils.formatPoints(spiritualGrowth.totalPoints)} points
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {spiritualGrowth.streaks
                .filter(streak => streak.currentStreak > 0)
                .map((streak) => (
                  <div key={streak.type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{streak.type}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{streak.currentStreak}</span>
                      <span className="text-sm">
                        {spiritualMetricsUtils.getStreakEmoji(streak.currentStreak)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2">
                  <span className="text-lg">{achievement.badgeIcon}</span>
                  <div>
                    <p className="text-sm font-medium">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.points} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Goals
          </CardTitle>
          <CardDescription>
            {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active goals</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => onFeatureClick('add_goal')}
              >
                Set Your First Goal
              </Button>
            </div>
          ) : (
            activeGoals.map((goal) => (
              <div key={goal.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{goal.title}</h4>
                  <Badge variant="outline">{goal.progress}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {goal.description}
                </p>
                <Progress value={goal.progress} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Target: {goal.targetDate.toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 border rounded-lg">
                <h5 className="font-medium">{rec.title}</h5>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {rec.confidence}% confidence
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}