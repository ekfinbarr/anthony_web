import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, User } from 'lucide-react';

interface MarriageClass {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  time: string;
  days: string[];
  facilitator: string;
  venue: string;
  seatsAvailable: number;
  totalSeats: number;
  description: string;
}

interface MarriageClassCardProps {
  classData: MarriageClass;
  onRegister: (classData: MarriageClass) => void;
}

const MarriageClassCard: React.FC<MarriageClassCardProps> = ({ classData, onRegister }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isFull = classData.seatsAvailable === 0;
  const isAlmostFull = classData.seatsAvailable <= 3 && classData.seatsAvailable > 0;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-heading text-church-charcoal mb-2">
              {classData.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {classData.description}
            </CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isFull
              ? 'bg-red-100 text-red-800'
              : isAlmostFull
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {isFull ? 'Full' : `${classData.seatsAvailable} seats left`}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Class Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>
              {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>{classData.time}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>{classData.venue}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>Facilitator: {classData.facilitator}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span>
              {classData.days.join(', ')} • {classData.totalSeats} total seats
            </span>
          </div>
        </div>

        {/* Register Button */}
        <div className="pt-2">
          <Button
            onClick={() => onRegister(classData)}
            disabled={isFull}
            className="w-full"
            variant={isFull ? "outline" : "church"}
          >
            {isFull ? 'Class Full' : 'Register Now'}
          </Button>
        </div>

        {/* Additional Info */}
        {!isFull && (
          <p className="text-xs text-muted-foreground text-center">
            Registration required. Contact parish office for questions.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MarriageClassCard;