import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, CreditCard, Church, MessageSquare, Image, Radio } from "lucide-react";

const stats = [
  { title: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "text-blue-500" },
  { title: "Posts", value: "156", change: "+8%", icon: FileText, color: "text-green-500" },
  { title: "Events", value: "24", change: "+3", icon: Calendar, color: "text-purple-500" },
  { title: "Donations", value: "₦2.4M", change: "+18%", icon: CreditCard, color: "text-primary" },
  { title: "Mass Bookings", value: "89", change: "+5", icon: Church, color: "text-orange-500" },
  { title: "Contact Messages", value: "32", change: "12 unread", icon: MessageSquare, color: "text-red-500" },
  { title: "Gallery Items", value: "487", change: "+45", icon: Image, color: "text-pink-500" },
  { title: "Livestreams", value: "12", change: "2 scheduled", icon: Radio, color: "text-indigo-500" },
];

const recentActivity = [
  { action: "New user registered", user: "John Doe", time: "2 minutes ago" },
  { action: "Post published", user: "Admin", time: "15 minutes ago" },
  { action: "Donation received", user: "Jane Smith", time: "1 hour ago" },
  { action: "Mass booking approved", user: "Fr. Anthony", time: "2 hours ago" },
  { action: "Event created", user: "Admin", time: "3 hours ago" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">by {activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
