import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Filter, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import bannerPhoto from "@/assets/images/church_banner.jpg";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const events = [
    {
      id: 1,
      title: "Annual Church Conference",
      date: "November 18, 2024",
      time: "9:00 AM - 4:00 PM",
      location: "Main Sanctuary",
      category: "Conference",
      description: "Join us for our annual conference featuring inspiring speakers, workshops, and fellowship.",
      attendees: 250,
      image: bannerPhoto,
      registration: true,
    },
    {
      id: 2,
      title: "Youth Worship Night",
      date: "November 22, 2024",
      time: "7:00 PM - 9:30 PM",
      location: "Youth Hall",
      category: "Youth",
      description: "An evening of praise, worship, and fellowship designed for our youth community.",
      attendees: 80,
      image: bannerPhoto,
      registration: false,
    },
    {
      id: 3,
      title: "Community Thanksgiving Dinner",
      date: "November 28, 2024",
      time: "5:00 PM - 8:00 PM",
      location: "Fellowship Hall",
      category: "Community",
      description: "Share a traditional Thanksgiving meal with our church family and community.",
      attendees: 150,
      image: bannerPhoto,
      registration: true,
    },
    {
      id: 4,
      title: "Women's Bible Study",
      date: "December 2, 2024",
      time: "10:00 AM - 12:00 PM",
      location: "Room 201",
      category: "Bible Study",
      description: "Deep dive into scripture with fellowship and discussion for women of all ages.",
      attendees: 30,
      image: bannerPhoto,
      registration: false,
    },
    {
      id: 5,
      title: "Christmas Carol Service",
      date: "December 15, 2024",
      time: "6:00 PM",
      location: "Main Sanctuary",
      category: "Worship",
      description: "Celebrate the season with traditional carols and the Christmas story.",
      attendees: 400,
      image: bannerPhoto,
      registration: false,
    },
    {
      id: 6,
      title: "Men's Prayer Breakfast",
      date: "December 7, 2024",
      time: "7:00 AM - 9:00 AM",
      location: "Fellowship Hall",
      category: "Fellowship",
      description: "Start your Saturday with prayer, fellowship, and a hearty breakfast.",
      attendees: 50,
      image: bannerPhoto,
      registration: true,
    },
  ];

  const categories = ["All", "Conference", "Youth", "Community", "Bible Study", "Worship", "Fellowship"];

  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-dark text-church-pearl">
        <div className="absolute inset-0 pattern-geometric" />
        <div className="container mx-auto px-4 relative">
          <h1 className="text-5xl font-heading font-bold mb-4 text-center">Upcoming Events</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
            Join us for worship, fellowship, and community activities
          </p>
        </div>
      </section>

      {/* Calendar View Toggle */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category.toLowerCase() ? "church" : "outline"}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Featured Event */}
            {filteredEvents.length > 0 && (
              <Card className="mb-12 overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <img 
                    src={filteredEvents[0].image} 
                    alt={filteredEvents[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="p-8">
                    <Badge className="mb-4 bg-gradient-church text-church-charcoal">Featured Event</Badge>
                    <h2 className="text-3xl font-heading font-bold mb-4">{filteredEvents[0].title}</h2>
                    <p className="text-muted-foreground mb-6">{filteredEvents[0].description}</p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-3" />
                        <span>{filteredEvents[0].date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-primary mr-3" />
                        <span>{filteredEvents[0].time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-3" />
                        <span>{filteredEvents[0].location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-primary mr-3" />
                        <span>{filteredEvents[0].attendees} Expected Attendees</span>
                      </div>
                    </div>
                    {filteredEvents[0].registration && (
                      <Button variant="church" size="lg" className="w-full md:w-auto">
                        Register Now
                        <ChevronRight className="ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(1).map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.category}
                      </Badge>
                      {event.registration && (
                        <span className="text-xs text-primary font-semibold">Registration Open</span>
                      )}
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
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
                    <Button variant="link" className="p-0 mt-4 group">
                      Learn More
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regular Activities */}
      <section className="py-12 bg-church-pearl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-4">Regular Activities</h2>
          <p className="text-lg text-church-charcoal/80 mb-8 max-w-2xl mx-auto">
            We have weekly gatherings and activities for all ages. Everyone is welcome!
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Sunday Masses</h3>
              <p className="text-sm text-muted-foreground">
                9:00 AM & 11:00 AM - Main Sanctuary
              </p>
            </Card>
            {/* Confession */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Confession</h3>
              <p className="text-sm text-muted-foreground">
                Saturdays 4:00 PM - 5:00 PM - Reconciliation Room
              </p>
            </Card>
            {/* Adoration */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Eucharistic Adoration</h3>
              <p className="text-sm text-muted-foreground">
                Fridays 9:00 AM - 6:00 PM - Chapel
              </p>
            </Card>
            {/* Bible Studies */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Wednesday Bible Study</h3>
              <p className="text-sm text-muted-foreground">
                7:00 PM - Room 101
              </p>
            </Card>
            {/* Youth Group */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Youth Group</h3>
              <p className="text-sm text-muted-foreground">
                Fridays 6:30 PM - Youth Hall
              </p>
            </Card>
            {/* Choir Practice */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Choir Practice</h3>
              <p className="text-sm text-muted-foreground">
                Thursdays 7:00 PM - Music Room
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12 bg-church-pearl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Event Calendar</h2>
          <Card className="max-w-4xl mx-auto p-8">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-24 w-24 mx-auto mb-4 text-primary" />
              <p className="text-lg">Full calendar view coming soon!</p>
              <p className="mt-2">Subscribe to our calendar to stay updated on all events.</p>
              <Button variant="church" className="mt-6">
                Subscribe to Calendar
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-church">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-4">
            Want to Host an Event?
          </h2>
          <p className="text-lg text-church-charcoal/80 mb-6 max-w-2xl mx-auto">
            We welcome community events that align with our mission. Contact us to discuss your event idea.
          </p>
          <Button variant="secondary" size="lg">
            Contact Event Coordinator
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Events;