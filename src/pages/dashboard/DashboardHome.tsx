import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  IdCard,
  Church,
  Bell,
  Heart,
  Users,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const quickActions = [
  { name: "Book Mass", href: "/dashboard/mass-bookings", icon: Calendar, color: "bg-blue-500" },
  { name: "Make Donation", href: "/dashboard/donations", icon: CreditCard, color: "bg-green-500" },
  { name: "Parish Card", href: "/dashboard/parish-card", icon: IdCard, color: "bg-purple-500" },
  { name: "Book Sacrament", href: "/dashboard/sacraments", icon: Church, color: "bg-orange-500" },
];

const recentActivities = [
  {
    id: 1,
    type: "mass",
    title: "Mass Intention Booked",
    description: "Thanksgiving Mass for family",
    date: "Dec 15, 2024",
    status: "completed",
  },
  {
    id: 2,
    type: "donation",
    title: "Donation Made",
    description: "₦50,000 to Parish Projects",
    date: "Dec 10, 2024",
    status: "completed",
  },
  {
    id: 3,
    type: "sacrament",
    title: "Baptism Booking",
    description: "Scheduled for Dec 25, 2024",
    date: "Dec 5, 2024",
    status: "pending",
  },
];

const upcomingEvents = [
  { id: 1, title: "Christmas Eve Mass", date: "Dec 24, 2024", time: "10:00 PM" },
  { id: 2, title: "Christmas Day Masses", date: "Dec 25, 2024", time: "6:30 AM, 8:30 AM, 10:30 AM" },
  { id: 3, title: "New Year's Day Mass", date: "Jan 1, 2025", time: "9:00 AM" },
];

const DashboardHome = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-xl p-6 text-secondary-foreground">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
          {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-secondary-foreground/80">
          Welcome to your parishioner dashboard. Manage your church activities and stay connected.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">5</div>
            <p className="text-sm text-muted-foreground">Mass Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">₦150K</div>
            <p className="text-sm text-muted-foreground">Total Donations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">2</div>
            <p className="text-sm text-muted-foreground">Groups Joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">3</div>
            <p className="text-sm text-muted-foreground">Notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="font-medium text-sm text-center">{action.name}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/notifications">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.status === "completed" ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  {activity.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                </div>
                <Badge variant={activity.status === "completed" ? "secondary" : "outline"} className="capitalize">
                  {activity.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Parish calendar</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Parish Card Reminder */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <IdCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Get Your Digital Parish Card</h3>
              <p className="text-sm text-muted-foreground">
                Access your unique QR code for easy identification at church events
              </p>
            </div>
          </div>
          <Button asChild variant="church">
            <Link to="/dashboard/parish-card">
              Generate Card <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
