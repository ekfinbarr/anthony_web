import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Love",
      description: "We believe in showing God's love through our actions and relationships.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We value authentic relationships and doing life together.",
    },
    {
      icon: Target,
      title: "Purpose",
      description: "We help people discover and fulfill their God-given purpose.",
    },
  ];

  const leadership = [
    {
      name: "Pastor John Smith",
      role: "Senior Pastor",
      bio: "Pastor John has been serving Grace Church for over 15 years with a heart for community and spiritual growth.",
      image: "/api/placeholder/300/300",
    },
    {
      name: "Sarah Johnson",
      role: "Worship Leader",
      bio: "Sarah leads our worship team with passion and creates an atmosphere for encountering God's presence.",
      image: "/api/placeholder/300/300",
    },
    {
      name: "Michael Davis",
      role: "Youth Pastor",
      bio: "Michael is dedicated to mentoring the next generation and helping them grow in their faith journey.",
      image: "/api/placeholder/300/300",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-dark text-church-pearl">
        <div className="absolute inset-0 pattern-geometric" />
        <div className="container mx-auto px-4 relative">
          <h1 className="text-5xl font-heading font-bold mb-4 text-center">About Grace Church</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
            Discover our story, mission, and the heart behind everything we do
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-6 accent-line">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Grace Church began in 1985 with a small group of families gathering in a living room, 
                united by a shared vision to create a church that would impact our community with God's love.
              </p>
              <p className="text-muted-foreground mb-4">
                Over the years, we've grown from that humble beginning into a vibrant community of believers 
                from all walks of life. Our journey has been marked by God's faithfulness, countless changed 
                lives, and a deepening commitment to serve our city and beyond.
              </p>
              <p className="text-muted-foreground">
                Today, Grace Church is home to over 1,500 members who are passionate about worship, 
                discipleship, and making a difference in the world. We continue to be guided by the same 
                vision that started it all: to be a beacon of hope and love in our community.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/api/placeholder/600/400" 
                alt="Church History" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-church shape-diamond opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <Eye className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-heading font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To be a church where people encounter God, find community, and discover their purpose 
                  in advancing God's kingdom on earth.
                </p>
              </Card>
              <Card className="p-8">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-heading font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To lead people into a growing relationship with Jesus Christ through worship, 
                  discipleship, fellowship, and service.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12 accent-line inline-block w-full">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="bg-gradient-church p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-10 w-10 text-church-charcoal" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {leadership.map((leader) => (
              <Card key={leader.name} className="overflow-hidden">
                <img 
                  src={leader.image} 
                  alt={leader.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-heading font-semibold mb-1">{leader.name}</h3>
                  <p className="text-primary font-medium mb-3">{leader.role}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section id="services" className="py-16 bg-gradient-church">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12 text-church-charcoal">
            Join Us for Worship
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold mb-4">Service Times</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Sunday Worship:</strong> 9:00 AM & 11:00 AM</p>
                <p><strong>Wednesday Bible Study:</strong> 7:00 PM</p>
                <p><strong>Youth Service:</strong> Fridays 7:00 PM</p>
              </div>
            </Card>
            <Card className="p-8 text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-semibold mb-4">Location</h3>
              <div className="text-muted-foreground">
                <p className="font-semibold mb-2">Grace Church</p>
                <p>123 Church Street</p>
                <p>City, ST 12345</p>
                <p className="mt-4">(555) 123-4567</p>
              </div>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link to="/visit">
              <Button variant="secondary" size="xl">
                Plan Your Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;