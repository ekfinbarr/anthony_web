import { Link } from "react-router-dom";
import { Baby, Users, Heart, Globe, BookOpen, Music } from "lucide-react";
import { Card } from "@/components/ui/card";

const MinistriesSection = () => {
  const ministries = [
    {
      name: "Children's Ministry",
      icon: Baby,
      description: "Nurturing faith in our youngest members through fun and engaging activities.",
      link: "/ministries/children",
      color: "bg-blue-500",
    },
    {
      name: "Youth Ministry",
      icon: Users,
      description: "Empowering teens to grow in faith and build lasting friendships.",
      link: "/ministries/youth",
      color: "bg-purple-500",
    },
    {
      name: "Adult Ministry",
      icon: BookOpen,
      description: "Deepening faith through Bible study, fellowship, and spiritual growth.",
      link: "/ministries/adults",
      color: "bg-green-500",
    },
    {
      name: "Worship Ministry",
      icon: Music,
      description: "Leading our congregation in worship through music and arts.",
      link: "/ministries/worship",
      color: "bg-red-500",
    },
    {
      name: "Care Ministry",
      icon: Heart,
      description: "Providing support and care for those in need within our community.",
      link: "/ministries/care",
      color: "bg-pink-500",
    },
    {
      name: "Outreach Ministry",
      icon: Globe,
      description: "Serving our local and global community through missions and service.",
      link: "/ministries/outreach",
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-geometric" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
            Our Ministries
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find your place to serve, grow, and make a difference in our community
          </p>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry) => {
            const Icon = ministry.icon;
            return (
              <Link key={ministry.name} to={ministry.link}>
                <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className={`${ministry.color} p-3 rounded-lg bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                      <Icon className={`h-6 w-6 text-primary`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {ministry.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {ministry.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-church opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-church opacity-5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default MinistriesSection;