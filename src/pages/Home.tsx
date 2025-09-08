import HeroSection from "@/components/home/HeroSection";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import SermonHighlight from "@/components/home/SermonHighlight";
import MinistriesSection from "@/components/home/MinistriesSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <HeroSection />
      
      {/* Welcome Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              Welcome to Grace Church
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're a community of believers passionate about Jesus and committed to sharing His love. 
              Whether you're exploring faith for the first time or looking for a church home, 
              you'll find a warm welcome here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with others through small groups and fellowship
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Service Times</h3>
                <p className="text-sm text-muted-foreground">
                  Sunday: 9:00 AM & 11:00 AM<br />Wednesday: 7:00 PM
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">
                  123 Church Street<br />City, ST 12345
                </p>
              </Card>
            </div>
            <Link to="/about">
              <Button variant="church" size="lg" className="group">
                Learn More About Us
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <UpcomingEvents />
      <SermonHighlight />
      <MinistriesSection />

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-church">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4">
            Ready to Visit?
          </h2>
          <p className="text-lg text-church-charcoal/80 mb-8 max-w-2xl mx-auto">
            We'd love to meet you! Join us this Sunday and experience the warmth of our church family.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/visit">
              <Button variant="secondary" size="xl">
                Plan Your Visit
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="xl" className="bg-transparent border-church-charcoal text-church-charcoal hover:bg-church-charcoal hover:text-church-pearl">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;