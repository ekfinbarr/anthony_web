import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarriageClassCard from '@/components/marriage/MarriageClassCard';
import MarriageClassRegisterModal from '@/components/marriage/MarriageClassRegisterModal';
import RegistrationHistory from '@/components/marriage/RegistrationHistory';

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

const MarriageClassRegistrationPage: React.FC = () => {
  const [classes, setClasses] = useState<MarriageClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<MarriageClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch available marriage classes
  const fetchAvailableClasses = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll load from the JSON file
      const response = await fetch('/src/data/marriage-classes.json');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching marriage classes:', error);
      // Fallback to empty array
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  const handleRegister = (classData: MarriageClass) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleRegistrationComplete = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    // Refresh data or show success message
    fetchAvailableClasses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-heading font-bold text-church-charcoal">
                  Marriage Class Registration
                </h1>
                <p className="text-muted-foreground mt-1">
                  Prepare for the Sacrament of Holy Matrimony
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Member Portal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-heading font-semibold text-church-charcoal mb-4">
              Prepare for Your Sacred Union
            </h2>
            <p className="text-lg text-muted-foreground">
              Our Pre-Cana classes provide essential preparation for couples preparing for the Sacrament of Holy Matrimony.
              Join us to strengthen your relationship and deepen your faith foundation.
            </p>
          </div>
        </div>

        {/* Available Classes */}
        <div className="mb-12">
          <h3 className="text-2xl font-heading font-semibold text-church-charcoal mb-6">
            Available Classes
          </h3>

          {classes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">No Classes Available</h4>
                <p className="text-muted-foreground">
                  There are currently no marriage preparation classes scheduled.
                  Please check back later or contact the parish office.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classData) => (
                <MarriageClassCard
                  key={classData.id}
                  classData={classData}
                  onRegister={handleRegister}
                />
              ))}
            </div>
          )}
        </div>

        {/* Registration History */}
        <RegistrationHistory />

        {/* Contact Information */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Contact the parish office for questions about marriage preparation classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Parish Office</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  📞 Phone: (555) 123-4567
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  ✉️ Email: office@stanthonygbaja.org
                </p>
                <p className="text-sm text-muted-foreground">
                  🕒 Office Hours: Mon-Fri 9AM-5PM
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Marriage Coordinator</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  📞 Sr. Mary Johnson: (555) 123-4568
                </p>
                <p className="text-sm text-muted-foreground">
                  💒 Specializes in marriage preparation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Modal */}
      {selectedClass && (
        <MarriageClassRegisterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classData={selectedClass}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}
    </div>
  );
};

export default MarriageClassRegistrationPage;