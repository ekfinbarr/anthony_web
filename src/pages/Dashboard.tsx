/**
 * Main Dashboard Page Component
 * Personalized member dashboard with AI-powered content feed, smart calendar,
 * spiritual growth tracking, and community connections
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Star,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Dashboard Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ContentFeed from '@/components/dashboard/ContentFeed';
import SmartCalendar from '@/components/dashboard/SmartCalendar';
import SpiritualGrowthTracker from '@/components/dashboard/SpiritualGrowthTracker';
import CommunityConnections from '@/components/dashboard/CommunityConnections';
import QuickActions from '@/components/dashboard/QuickActions';

// Hooks
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { usePersonalization } from '@/hooks/dashboard/usePersonalization';
import { useSpiritualGrowth } from '@/hooks/dashboard/useSpiritualGrowth';

// Utils
import { uiUtils } from '@/lib/dashboard-utils';

/**
 * Animation variants for dashboard sections
 */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

/**
 * Dashboard loading skeleton
 */
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

/**
 * Dashboard error state
 */
const DashboardError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-destructive">Dashboard Error</CardTitle>
        <CardDescription>
          We encountered an issue loading your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

/**
 * Main Dashboard Component
 */
export default function Dashboard() {
  // Dashboard data management
  const {
    user,
    contentFeed,
    upcomingEvents,
    spiritualGrowth,
    communityConnections,
    recommendations,
    isLoading,
    error,
    refreshDashboard,
    engageWithContent,
    lastUpdated
  } = useDashboardData({
    autoRefresh: true,
    mockData: true // Using mock data for demo
  });

  // Personalization tracking
  const {
    trackPageVisit,
    trackFeatureUsage,
    getPersonalizationInsights
  } = usePersonalization({
    enableTracking: true
  });

  // Spiritual growth tracking (only if user exists)
  const spiritualGrowthHook = useSpiritualGrowth(
    user?.id || 'demo_user',
    {
      enableAutoSave: true,
      enableNotifications: true
    }
  );

  /**
   * Track page visit on mount
   */
  useEffect(() => {
    trackPageVisit('dashboard');
    
    // Track initial load time for performance monitoring
    const loadTime = performance.now();
    console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
  }, [trackPageVisit]);

  /**
   * Handle feature interactions
   */
  const handleFeatureClick = (feature: string, context?: Record<string, unknown>) => {
    trackFeatureUsage(feature, context);
  };

  /**
   * Handle content engagement
   */
  const handleContentEngagement = async (
    contentId: string, 
    engagementType: 'view' | 'like' | 'share' | 'comment'
  ) => {
    try {
      await engageWithContent(contentId, engagementType);
      handleFeatureClick('content_engagement', { type: engagementType });
    } catch (error) {
      console.error('Failed to engage with content:', error);
    }
  };

  /**
   * Get dashboard statistics
   */
  const dashboardStats = React.useMemo(() => {
    if (!user || !spiritualGrowth) return null;

    return {
      totalContent: contentFeed?.length || 0,
      upcomingEventsCount: upcomingEvents?.length || 0,
      currentLevel: spiritualGrowth.currentLevel || 0,
      totalPoints: spiritualGrowth.totalPoints || 0,
      activeStreaks: spiritualGrowth.streaks?.filter(s => s.currentStreak > 0).length || 0,
      recommendations: recommendations?.length || 0
    };
  }, [user, spiritualGrowth, contentFeed, upcomingEvents, recommendations]);

  // Loading state
  if (isLoading && !user) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error && !user) {
    return <DashboardError error={error} onRetry={refreshDashboard} />;
  }

  // No user state (shouldn't happen in normal flow)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard</CardTitle>
            <CardDescription>
              Please log in to access your personalized dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Header */}
      <motion.div variants={itemVariants}>
        <DashboardHeader
          user={user}
          stats={dashboardStats}
          lastUpdated={lastUpdated}
          onRefresh={refreshDashboard}
          isRefreshing={isLoading}
        />
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions Bar */}
            <motion.div variants={itemVariants}>
              <QuickActions
                onActionClick={handleFeatureClick}
                spiritualGrowth={spiritualGrowth}
                upcomingEvents={upcomingEvents}
              />
            </motion.div>

            {/* Dashboard Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="feed" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger 
                    value="feed" 
                    className="flex items-center gap-2"
                    onClick={() => handleFeatureClick('tab_feed')}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Feed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calendar" 
                    className="flex items-center gap-2"
                    onClick={() => handleFeatureClick('tab_calendar')}
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="growth" 
                    className="flex items-center gap-2"
                    onClick={() => handleFeatureClick('tab_growth')}
                  >
                    <Star className="h-4 w-4" />
                    Growth
                  </TabsTrigger>
                  <TabsTrigger 
                    value="community" 
                    className="flex items-center gap-2"
                    onClick={() => handleFeatureClick('tab_community')}
                  >
                    <Users className="h-4 w-4" />
                    Community
                  </TabsTrigger>
                </TabsList>

                {/* Content Feed Tab */}
                <TabsContent value="feed" className="mt-6">
                  <ContentFeed
                    content={contentFeed}
                    recommendations={recommendations.filter(r => r.type === 'content')}
                    onEngagement={handleContentEngagement}
                    onFeatureClick={handleFeatureClick}
                    isLoading={isLoading}
                  />
                </TabsContent>

                {/* Smart Calendar Tab */}
                <TabsContent value="calendar" className="mt-6">
                  <SmartCalendar
                    events={upcomingEvents}
                    recommendations={recommendations.filter(r => r.type === 'event')}
                    onEventClick={(eventId) => handleFeatureClick('event_view', { eventId })}
                    onFeatureClick={handleFeatureClick}
                    userPreferences={user.preferences}
                  />
                </TabsContent>

                {/* Spiritual Growth Tab */}
                <TabsContent value="growth" className="mt-6">
                  <SpiritualGrowthTracker
                    spiritualGrowth={spiritualGrowth}
                    recommendations={recommendations.filter(r => r.type === 'goal' || r.type === 'activity')}
                    onActivityAdd={spiritualGrowthHook.addActivity}
                    onGoalAdd={spiritualGrowthHook.addGoal}
                    onFeatureClick={handleFeatureClick}
                    isLoading={spiritualGrowthHook.isLoading}
                  />
                </TabsContent>

                {/* Community Connections Tab */}
                <TabsContent value="community" className="mt-6">
                  <CommunityConnections
                    connections={communityConnections}
                    recommendations={recommendations.filter(r => r.type === 'connection')}
                    onConnectionClick={(connectionId) => 
                      handleFeatureClick('community_join', { connectionId })
                    }
                    onFeatureClick={handleFeatureClick}
                    userInterests={user.interests}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized suggestions based on your activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {recommendations.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Continue using the dashboard to receive personalized recommendations
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recommendations.slice(0, 5).map((recommendation) => (
                          <div
                            key={recommendation.id}
                            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => handleFeatureClick('recommendation_click', {
                              type: recommendation.type,
                              id: recommendation.id
                            })}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {recommendation.title}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {recommendation.confidence}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {recommendation.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardStats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Level</span>
                        <Badge variant="outline">
                          {spiritualGrowthHook.levelTitle}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Points</span>
                        <span className="font-medium">
                          {uiUtils.formatNumber(dashboardStats.totalPoints)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Streaks</span>
                        <span className="font-medium">
                          {dashboardStats.activeStreaks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Upcoming Events</span>
                        <span className="font-medium">
                          {dashboardStats.upcomingEventsCount}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Personalization Insights */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getPersonalizationInsights().map((insight, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {insight}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Last updated: {uiUtils.formatRelativeTime(lastUpdated)}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link to="/notification-settings">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}