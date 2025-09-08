import { Link } from "react-router-dom";
import { Baby, Users, Heart, Globe, BookOpen, Music } from "lucide-react";
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
    </div>
  );
};

export default Ministries;