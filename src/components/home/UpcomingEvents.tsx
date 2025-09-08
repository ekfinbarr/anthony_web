import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UpcomingEvents = () => {
  const events = [
    {
      id: 1,
      title: "Annual Church Conference",
      date: "Nov 18, 2024",
      time: "9:00 AM - 4:00 PM",
      location: "Main Sanctuary",
      description: "Join us for our annual conference with special speakers and workshops.",
      category: "Conference",
      image: "/api/placeholder/400/250",
    },
    {
      id: 2,
      title: "Youth Worship Night",
      date: "Nov 22, 2024",
      time: "7:00 PM",
      location: "Youth Hall",
      description: "An evening of praise, worship, and fellowship for our youth.",
      category: "Youth",
      image: "/api/placeholder/400/250",
    },
    {
      id: 3,
      title: "Community Thanksgiving Dinner",
      date: "Nov 28, 2024",
      time: "5:00 PM",
      location: "Fellowship Hall",
      description: "Share a meal and give thanks with our church family.",
      category: "Community",
      image: "/api/placeholder/400/250",
    },
  ];

  return (
    <section className="py-16 bg-church-pearl">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
            Upcoming Events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for worship, fellowship, and community events throughout the month
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden card-hover group">
              <div className="h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-gradient-church text-church-charcoal rounded-full">
                    {event.category}
                  </span>
                </div>
                <CardTitle className="font-heading text-xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-primary mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-primary mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <Link to={`/events/${event.id}`}>
                  <Button variant="link" className="p-0 mt-4 group">
                    Learn More
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/events">
            <Button variant="church" size="lg">
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;