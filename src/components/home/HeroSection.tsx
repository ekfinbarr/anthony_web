import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import churchHero from "@/assets/church-hero.jpg";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome Home",
      subtitle: "Experience God's Love in Community",
      image: churchHero,
      cta: "Plan Your Visit",
      link: "/visit",
    },
    {
      title: "Join Us This Sunday",
      subtitle: "Worship Services at 9:00 & 11:00 AM",
      image: churchHero,
      cta: "Service Times",
      link: "/about#services",
    },
    {
      title: "Making a Difference",
      subtitle: "Serving Our Community Together",
      image: churchHero,
      cta: "Get Involved",
      link: "/ministries",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
      ))}

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 pattern-geometric pointer-events-none" />

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-church-pearl mb-4 text-shadow-hero">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-church-pearl/90 mb-8 text-shadow-hero">
              {slides[currentSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={slides[currentSlide].link}>
                <Button variant="church" size="xl" className="group">
                  {slides[currentSlide].cta}
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="xl" className="bg-church-pearl/10 border-church-pearl text-church-pearl hover:bg-church-pearl/20">
                  Upcoming Events
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-md">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-church-pearl/80">Sunday Service</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-church-pearl/80">Community</p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-church-pearl/80">Ministries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "bg-church-pearl/50 hover:bg-church-pearl/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;