/**
 * Quick Actions Component
 * Provides quick access to common dashboard actions and features
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Calendar,
  BookOpen,
  Heart,
  Users,
  Bell,
  Target,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { SpiritualGrowth, CalendarEvent } from '@/types/dashboard';

interface QuickActionsProps {
  onActionClick: (action: string, context?: Record<string, any>) => void;
  spiritualGrowth: SpiritualGrowth | null;
  upcomingEvents: CalendarEvent[];
}

export default function QuickActions({
  onActionClick,
  spiritualGrowth,
  upcomingEvents
}: QuickActionsProps) {
  const actions = [
    {
      id: 'add_activity',
      label: 'Log Activity',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Track activities'
    },
    {
      id: 'view_calendar',
      label: 'Calendar',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Upcoming events',
      badge: upcomingEvents.length > 0 ? upcomingEvents.length : undefined
    },
    {
      id: 'daily_reading',
      label: 'Daily Reading',
      icon: BookOpen,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Scriptures', // 'Scripture & devotionals'
    },
    {
      id: 'prayer_requests',
      label: 'Prayer',
      icon: Heart,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Mass Requests', //'Prayer requests & tracking'
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Connect with others'
    },
    // {
    //   id: 'goals',
    //   label: 'Goals',
    //   icon: Target,
    //   color: 'bg-indigo-500 hover:bg-indigo-600',
    //   description: 'Spiritual goals & progress'
    // }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4 relative"
                  onClick={() => onActionClick(action.id)}
                >
                  {action.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {action.badge > 9 ? '9+' : action.badge}
                    </Badge>
                  )}
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}