import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Heart } from 'lucide-react';
import marriageBansData from '@/data/marriage-bans.json';

interface MarriageBan {
  id: number;
  brideName: string;
  groomName: string;
  homeParish: string;
  announcementDate: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  priest: string;
  announcementRound: number;
  canonicalText: string;
}

export default function MarriageBansPage() {
  const [marriageBans] = useState<MarriageBan[]>(marriageBansData.marriageBans);

  const getRoundColor = (round: number) => {
    switch (round) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-green-100 text-green-800 border-green-200';
      case 3: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Marriage Banns
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              According to the tradition of the Catholic Church, marriage banns are announced
              to ensure there are no impediments to the marriage.
            </p>
          </div>
        </div>
      </div>

      {/* Canonical Text */}
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6">
              "{marriageBans[0]?.canonicalText}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Marriage Banns Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {marriageBans.map((ban) => (
            <Card key={ban.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getRoundColor(ban.announcementRound)}>
                    Round {ban.announcementRound}
                  </Badge>
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl text-center">
                  {ban.brideName} & {ban.groomName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Home Parish: {ban.homeParish}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Announcement: {formatDate(ban.announcementDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Wedding: {formatDate(ban.weddingDate)} at {ban.weddingTime}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Wedding Details</p>
                    <p className="text-muted-foreground">{ban.venue}</p>
                    <p className="text-muted-foreground">Celebrant: {ban.priest}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Information */}
      <div className="bg-muted/50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-semibold mb-2">About Marriage Banns</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Marriage banns are public announcements made in the parish church announcing
            an intended marriage. They are published on three consecutive Sundays or
            holy days of obligation.
          </p>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Should you know of any impediment:</strong> Please contact the parish priest
              or marriage tribunal as soon as possible.
            </p>
            <p>
              <strong>Contact:</strong> Fr. Emmanuel Okon • Phone: (234) 123 456 7899 •
              Email: priest@stanthonygbaja.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}