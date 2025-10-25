/**
 * Dashboard Header Component
 * Displays personalized greeting, user information, stats, and navigation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Settings, 
  Bell,
  User,
  Calendar,
  TrendingUp,
  Star,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

// Types
import { UserProfile } from '@/types/dashboard';

// Utils
import { uiUtils } from '@/lib/dashboard-utils';
import { spiritualMetricsUtils } from '@/lib/spiritual-metrics';

/**
 * Dashboard statistics interface
 */
interface DashboardStats {
  totalContent: number;
  upcomingEventsCount: number;
  currentLevel: number;
  totalPoints: number;
  activeStreaks: number;
  recommendations: number;
}

/**
 * Dashboard header props
 */
interface DashboardHeaderProps {
  user: UserProfile;
  stats: DashboardStats | null;
  lastUpdated: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * Get personalized greeting based on time of day
 */
const getGreeting = (name: string): string => {
  const hour = new Date().getHours();
  let timeGreeting = 'Good evening';
  
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  }
  
  return `${timeGreeting}, ${name.split(' ')[0]}!`;
};

/**
 * Get motivational message based on user stats and time
 */
const getMotivationalMessage = (stats: DashboardStats | null): string => {
  if (!stats) return "Welcome to your spiritual dashboard";
  
  const messages = [
    "Ready to continue your spiritual journey?",
    "Let's see what's new in your community today",
    "Your faith journey is making a difference",
    "Every step forward counts in your spiritual growth",
    "God has great plans for your day ahead"
  ];
  
  // Customize based on stats
  if (stats.activeStreaks > 0) {
    return `Amazing! You have ${stats.activeStreaks} active streak${stats.activeStreaks > 1 ? 's' : ''}. Keep it up!`;
  }
  
  if (stats.upcomingEventsCount > 0) {
    return `You have ${stats.upcomingEventsCount} upcoming event${stats.upcomingEventsCount > 1 ? 's' : ''}. Don't miss out!`;
  }
  
  if (stats.recommendations > 0) {
    return `${stats.recommendations} new recommendation${stats.recommendations > 1 ? 's' : ''} waiting for you!`;
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Dashboard Header Component
 */
export default function DashboardHeader({
  user,
  stats,
  lastUpdated,
  onRefresh,
  isRefreshing
}: DashboardHeaderProps) {
  const greeting = getGreeting(user.name);
  const motivationalMessage = getMotivationalMessage(stats);
  const userInitials = uiUtils.getInitials(user.name);
  const avatarColor = uiUtils.getAvatarColor(user.name);

  return (
    <motion.header
      className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section - User Greeting & Info */}
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className={`${avatarColor} text-white font-semibold text-lg`}>
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {/* Greeting & Info */}
            <div className="space-y-1">
              <motion.h1 
                className="text-2xl lg:text-3xl font-bold text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {greeting}
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {motivationalMessage}
              </motion.p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Member since {uiUtils.formatDate(user.joinDate, 'short')}</span>
                {stats && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-primary">
                      {spiritualMetricsUtils.getLevelTitle(stats.currentLevel)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Stats & Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Quick Stats Cards */}
            {stats && (
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Current Level */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-3 text-center min-w-[80px]">
                    <div className="text-lg font-bold text-primary">
                      {stats.currentLevel}
                    </div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </CardContent>
                </Card>

                {/* Total Points */}
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardContent className="p-3 text-center min-w-[80px]">
                    <div className="text-lg font-bold text-accent-foreground">
                      {uiUtils.formatNumber(stats.totalPoints)}
                    </div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </CardContent>
                </Card>

                {/* Active Streaks */}
                <Card className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800">
                  <CardContent className="p-3 text-center min-w-[80px]">
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">
                      {stats.activeStreaks}
                    </div>
                    <div className="text-xs text-muted-foreground">Streaks</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {/* Notifications */}
              <Link to="/notification-settings">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {stats && stats.recommendations > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {stats.recommendations > 9 ? '9+' : stats.recommendations}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/profile-settings" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/notification-settings" className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive"
                    onClick={() => {
                      // Handle sign out - for now just redirect to home
                      window.location.href = '/';
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>

        {/* Level Progress Bar (if stats available) */}
        {stats && (
          <motion.div 
            className="mt-4 lg:mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-card/50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Progress to Level {stats.currentLevel + 1}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {uiUtils.formatNumber(stats.totalPoints)} points
                </span>
              </div>
              <Progress 
                value={75} /* This would be calculated based on points to next level */
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Level {stats.currentLevel}</span>
                <span>Level {stats.currentLevel + 1}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Updated Info */}
        <motion.div 
          className="mt-4 text-xs text-muted-foreground flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span>
            Last updated: {uiUtils.formatRelativeTime(lastUpdated)}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}