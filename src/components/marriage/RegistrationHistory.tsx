import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface RegistrationRecord {
  id: string;
  classId: string;
  classTitle: string;
  registrationDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  startDate: string;
  endDate: string;
  time: string;
  venue: string;
  facilitator: string;
  partnerName?: string;
  notes?: string;
}

// Mock data - in a real app, this would come from an API
const MOCK_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'reg-001',
    classId: 'mc-001',
    classTitle: 'Pre-Cana Class – Session A',
    registrationDate: '2024-11-15T10:30:00Z',
    status: 'confirmed',
    startDate: '2024-12-15',
    endDate: '2024-12-17',
    time: '7:00 PM - 9:00 PM',
    venue: 'Parish Hall',
    facilitator: 'Fr. John Smith',
    partnerName: 'Jane Doe',
    notes: 'Looking forward to the preparation sessions'
  },
  {
    id: 'reg-002',
    classId: 'mc-002',
    classTitle: 'Pre-Cana Class – Session B',
    registrationDate: '2024-10-20T14:15:00Z',
    status: 'completed',
    startDate: '2024-11-10',
    endDate: '2024-11-12',
    time: '6:00 PM - 8:00 PM',
    venue: 'Catechetics Hall',
    facilitator: 'Sr. Mary Johnson',
    partnerName: 'John Smith',
    notes: 'Completed all sessions successfully'
  }
];

const RegistrationHistory: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user registration history
  const fetchUserRegistrationHistory = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRegistrations(MOCK_REGISTRATIONS);
    } catch (error) {
      console.error('Error fetching registration history:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRegistrationHistory();
  }, [fetchUserRegistrationHistory]);

  const getStatusBadge = (status: RegistrationRecord['status']) => {
    const statusConfig = {
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmed' },
      pending: { variant: 'secondary' as const, icon: AlertCircle, text: 'Pending' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' },
      completed: { variant: 'outline' as const, icon: CheckCircle, text: 'Completed' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRegistrationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Registration History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Registration History</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserRegistrationHistory}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Your marriage preparation class registrations and history
        </CardDescription>
      </CardHeader>

      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Registrations Yet</h3>
            <p className="text-muted-foreground">
              You haven't registered for any marriage preparation classes yet.
              Browse available classes above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card key={registration.id} className="border-l-4 border-l-primary/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-church-charcoal mb-1">
                        {registration.classTitle}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Registered on {formatRegistrationDate(registration.registrationDate)}
                      </p>
                    </div>
                    {getStatusBadge(registration.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {formatDate(registration.startDate)} - {formatDate(registration.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{registration.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>{registration.venue}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span>Facilitator: {registration.facilitator}</span>
                      </div>
                      {registration.partnerName && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          <span>Partner: {registration.partnerName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {registration.notes && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {registration.notes}
                      </p>
                    </div>
                  )}

                  {/* Action buttons based on status */}
                  <div className="flex gap-2 mt-4">
                    {registration.status === 'confirmed' && (
                      <>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Registration
                        </Button>
                      </>
                    )}
                    {registration.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Confirm Registration
                      </Button>
                    )}
                    {registration.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        View Certificate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-semibold mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-primary" />
            Need Help?
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            If you have questions about your registrations or need to make changes,
            please contact the parish marriage coordinator.
          </p>
          <div className="text-sm">
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> marriage@stanthonygbaja.org</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrationHistory;