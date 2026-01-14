/**
 * Smart Calendar Component
 * Displays events with conflict detection, smart scheduling, and AI recommendations
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { CalendarEvent, AIRecommendation, UserPreferences } from '@/types/dashboard';
import { uiUtils } from '@/lib/dashboard-utils';

interface SmartCalendarProps {
  events: CalendarEvent[];
  recommendations: AIRecommendation[];
  onEventClick: (eventId: string) => void;
  onFeatureClick: (feature: string, context?: Record<string, unknown>) => void;
  userPreferences: UserPreferences;
}

export default function SmartCalendar({
  events,
  recommendations,
  onEventClick,
  onFeatureClick,
  userPreferences
}: SmartCalendarProps) {
  const [view, setView] = useState<'agenda' | 'week' | 'month'>(
    userPreferences.calendarSettings.defaultView
  );

  const upcomingEvents = events
    .filter(event => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Calendar</h2>
          <p className="text-muted-foreground">
            Your upcoming events with intelligent conflict detection
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            {upcomingEvents.length} events in the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                onClick={() => onEventClick(event.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{event.title}</h4>
                  {event.conflictLevel && event.conflictLevel !== 'none' && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Conflict
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {event.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {uiUtils.formatDate(event.startDate, 'time')} - 
                      {uiUtils.formatDate(event.endDate, 'time')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 border rounded-lg">
                <h5 className="font-medium">{rec.title}</h5>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}