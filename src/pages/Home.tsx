import HeroSection from "@/components/home/HeroSection";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import SermonHighlight from "@/components/home/SermonHighlight";
import MinistriesSection from "@/components/home/MinistriesSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Clock, MapPin, Eye, Target, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import LatestNews from "@/components/home/LatestNews";
// import dap from "@/assets/images/DAP.png";
import stAnthony from "@/assets/images/st_anthony.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const dap = "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36";
  return (
    <div>
      <HeroSection />

      {/* Welcome Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              Welcome to St. Anthony, Gbaja
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
                <h3 className="font-heading font-semibold text-lg mb-2">Mass Times</h3>
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

      {/* Parish Priest welcome note */}
      <section className="py-16 bg-church-pearl font-serif">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              A Message from Our Parish Priest
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              "Welcome to St. Anthony, Gbaja! It is my joy and privilege to serve as your parish priest.
              Our church is a place where faith is nurtured, lives are transformed, and God's love is shared.
              I invite you to join us in worship, fellowship, and service as we grow together in Christ."
            </p>
            <p className="text-lg font-semibold text-church-charcoal">- Very. Rev. Msgr. Bernard Okodua</p>
          </div>
        </div>
      </section>


      {/* Vision & Mission */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12 accent-line inline-block w-full">
            Our Vision & Mission
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            <div className="relative">
              <img
                src={"https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36"}
                alt="Church History"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <Card className="p-8 mb-8">
                <Eye className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-heading font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To be a vibrant, Christ-centered community that reflects God's love and grace,
                  empowering individuals to grow in faith and serve others.
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

      <LatestNews />

      {/* Member Portal Promotion */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              Your Personal Spiritual Journey
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Access your personalized member dashboard with AI-powered recommendations, 
              spiritual growth tracking, smart calendar, and community connections.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Personalized content and spiritual growth suggestions
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Growth Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your spiritual progress with goals and achievements
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with groups and ministries that match your interests
                </p>
              </Card>
            </div>
            <div className="space-y-4">
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6">
                  <User className="h-5 w-5 mr-2" />
                  Access Your Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                New member? Your dashboard is ready with personalized demo content to explore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12 accent-line inline-block w-full">
            Gallery
          </h2>
          <div className="relative">
            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={3}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={2500}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: { slidesToShow: 2 }
                },
                {
                  breakpoint: 640,
                  settings: { slidesToShow: 1 }
                }
              ]}
            >
              {[dap, stAnthony, dap, stAnthony, dap].map((imgSrc, idx) => (
                <div key={idx} className="px-2">
                  <img
                    src={imgSrc}
                    alt={`Gallery ${idx + 1}`}
                    className="rounded-lg shadow-lg w-full h-64 object-cover"
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>


      {/* Facilities Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12 accent-line inline-block w-full">
            Our Facilities
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={stAnthony}
                alt="Main Church Hall"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-2xl font-heading font-bold mb-2">Main Church Hall</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A beautiful and spacious hall for worship services and ceremonies.
                </p>
                <Button variant="outline" size="sm">
                  View Gallery
                </Button>
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={stAnthony}
                alt="Books and Sacramentary Shop"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-2xl font-heading font-bold mb-2">Books and Sacramentary Shop</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find spiritual books, Bibles, and sacramentaries for all occasions.
                </p>
                <Button variant="outline" size="sm">
                  View Gallery
                </Button>
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={stAnthony}
                alt="Meeting & Conference Rooms"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-2xl font-heading font-bold mb-2">Meeting & Conference Rooms</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Equipped rooms for meetings, conferences, and community gatherings.
                </p>
                <Button variant="outline" size="sm">
                  View Gallery
                </Button>
              </div>
            </Card>
            {/* Add more facility cards as needed */}
          </div>
        </div>
      </section>

      {/* Featured Sections */}

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