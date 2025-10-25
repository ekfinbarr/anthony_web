import { Link } from "react-router-dom";
import { Baby, Users, Heart, Globe, BookOpen, Music, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Ministries = () => {
  const ministries = [
    { name: "Children's Ministry", icon: Baby, description: "Nurturing faith in our youngest members.", link: "/ministries/children" },
    { name: "Youth Ministry", icon: Users, description: "Empowering teens to grow in faith.", link: "/ministries/youth" },
    { name: "Adult Ministry", icon: BookOpen, description: "Deepening faith through Bible study.", link: "/ministries/adults" },
    { name: "Worship Ministry", icon: Music, description: "Leading worship through music.", link: "/ministries/worship" },
    { name: "Care Ministry", icon: Heart, description: "Supporting those in need.", link: "/ministries/care" },
    { name: "Outreach Ministry", icon: Globe, description: "Serving our community.", link: "/ministries/outreach" },
  ];

  return (
    <div>
      <section className="relative py-24 bg-gradient-dark text-church-pearl">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-heading font-bold mb-4 text-center">Ministries</h1>
          <p className="text-xl text-center max-w-3xl mx-auto">Find your place to serve and grow</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {ministries.map((ministry) => {
              const Icon = ministry.icon;
              return (
                <Card key={ministry.name} className="p-6 hover:shadow-xl transition-shadow">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-heading font-semibold mb-2">{ministry.name}</h3>
                  <p className="text-muted-foreground mb-4">{ministry.description}</p>
                  <Button variant="link" className="p-0">Learn More →</Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Volunteer Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary-light/10 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold mb-4">Using Your Gifts</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            "As each has received a gift, use it to serve one another, as good stewards of God's varied grace." - 1 Peter 4:10
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every member of our parish has unique gifts and talents. Whether you're gifted in music, teaching, hospitality, or service, there's a place for you to use your abilities to build up the body of Christ.
            </p>
          {/* <Link to="/contact">
            <Button variant="church" size="lg" className="group">
              Volunteer Now
              <Heart className="ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </Link> */}
        </div>
      </section>

      {/* Questions About Ministries? */}
      <section className="py-12 bg-accent text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-bold mb-4">Questions About Ministries?</h2>
          <p className="text-lg text-white mb-6 max-w-2xl mx-auto">
            We're here to help you find the right ministry for you. Reach out to our ministry coordinator for more information.
          </p>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="group">
              Contact Us
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Ministries;