import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  Activity,
  Bandage,
  Baby,
  Heart,
  Shield,
  Pill,
  MessageCircle
} from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string;
}

interface ClinicServiceCardProps {
  service: Service;
}

const iconMap = {
  stethoscope: Stethoscope,
  activity: Activity,
  bandage: Bandage,
  baby: Baby,
  heart: Heart,
  shield: Shield,
  pill: Pill,
  'message-circle': MessageCircle,
};

export default function ClinicServiceCard({ service }: ClinicServiceCardProps) {
  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Stethoscope;

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <IconComponent className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-primary group-hover:text-blue-700 transition-colors">
              {service.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {service.description}
        </p>
        <div className="text-sm text-muted-foreground">
          <p className="line-clamp-3">{service.details}</p>
        </div>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
            Available Now
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}