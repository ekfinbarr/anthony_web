/**
 * Community Connections Component
 * Displays community groups, volunteer opportunities, and connection recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MapPin, Clock, Star } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { CommunityConnection, AIRecommendation } from '@/types/dashboard';

interface CommunityConnectionsProps {
  connections: CommunityConnection[];
  recommendations: AIRecommendation[];
  onConnectionClick: (connectionId: string) => void;
  onFeatureClick: (feature: string, context?: Record<string, unknown>) => void;
  userInterests: string[];
}

const connectionTypeColors = {
  small_group: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ministry: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  volunteer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  social: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  mentorship: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
};

export default function CommunityConnections({
  connections,
  recommendations,
  onConnectionClick,
  onFeatureClick,
  userInterests
}: CommunityConnectionsProps) {
  const availableConnections = connections.filter(conn => !conn.isJoined);
  const joinedConnections = connections.filter(conn => conn.isJoined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Connections</h2>
          <p className="text-muted-foreground">
            Find groups and opportunities that match your interests
          </p>
        </div>
      </div>

      {/* Recommended Connections */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Based on your interests and activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <motion.div
                key={rec.id}
                className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => onFeatureClick('recommendation_view', { id: rec.id })}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <Badge variant="default" className="text-xs">
                    {rec.confidence}% match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Available Groups</CardTitle>
          <CardDescription>
            {availableConnections.length} group{availableConnections.length !== 1 ? 's' : ''} available to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableConnections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No available groups at the moment</p>
            </div>
          ) : (
            availableConnections.map((connection) => (
              <motion.div
                key={connection.id}
                className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => onConnectionClick(connection.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{connection.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${connectionTypeColors[connection.type]}`}
                    >
                      {connection.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">
                      {connection.matchScore}% match
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {connection.memberCount} members
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {connection.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{connection.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{connection.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {connection.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {connection.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{connection.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm">Join Group</Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2 italic">
                  {connection.recommendationReason}
                </p>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Joined Connections */}
      {joinedConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
            <CardDescription>
              {joinedConnections.length} group{joinedConnections.length !== 1 ? 's' : ''} you're part of
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {joinedConnections.map((connection) => (
              <div key={connection.id} className="p-4 border rounded-lg bg-accent/20">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{connection.title}</h4>
                  <Badge variant="default" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Joined
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {connection.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{connection.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{connection.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}