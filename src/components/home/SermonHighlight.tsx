import { Play, Headphones, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const SermonHighlight = () => {
  const latestSermon = {
    title: "Walking in Faith",
    speaker: "Pastor John Smith",
    date: "November 10, 2024",
    series: "Faith Journey",
    description: "Discover how to strengthen your faith and trust in God's promises through life's challenges.",
    videoUrl: "#",
    audioUrl: "#",
    notesUrl: "#",
    thumbnail: "/api/placeholder/800/450",
  };

  return (
    <section className="py-16 bg-gradient-to-b from-church-pearl to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video/Image Section */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <img
                src={latestSermon.thumbnail}
                alt={latestSermon.title}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-church-charcoal/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="church"
                    size="icon"
                    className="h-16 w-16 rounded-full"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Geometric Decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-church shape-diamond opacity-20" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-church-stone shape-hexagon" />
          </div>

          {/* Content Section */}
          <div>
            <div className="mb-6">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Latest Message
              </span>
              <h2 className="text-4xl font-heading font-bold text-church-charcoal mt-2 mb-4">
                {latestSermon.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <span>{latestSermon.speaker}</span>
                <span>•</span>
                <span>{latestSermon.date}</span>
              </div>
              <p className="text-base text-muted-foreground mb-6">
                {latestSermon.description}
              </p>
              <div className="inline-block px-4 py-2 bg-church-stone rounded-lg mb-8">
                <span className="text-sm font-medium">Series: {latestSermon.series}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button variant="church" size="lg" className="group">
                <Play className="mr-2 h-5 w-5" />
                Watch Sermon
              </Button>
              <Button variant="outlineGold" size="lg">
                <Headphones className="mr-2 h-5 w-5" />
                Listen
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Notes
              </Button>
            </div>

            {/* Recent Sermons */}
            <Card className="p-6 bg-card hover:bg-card-hover transition-colors">
              <h3 className="font-heading font-semibold text-lg mb-4">Recent Messages</h3>
              <div className="space-y-3">
                {[
                  { title: "The Power of Prayer", date: "Nov 3, 2024" },
                  { title: "Living with Purpose", date: "Oct 27, 2024" },
                  { title: "God's Unfailing Love", date: "Oct 20, 2024" },
                ].map((sermon, index) => (
                  <Link
                    key={index}
                    to="/sermons"
                    className="flex items-center justify-between py-2 hover:text-primary transition-colors"
                  >
                    <div>
                      <p className="font-medium">{sermon.title}</p>
                      <p className="text-sm text-muted-foreground">{sermon.date}</p>
                    </div>
                    <Play className="h-4 w-4 text-primary" />
                  </Link>
                ))}
              </div>
              <Link to="/sermons">
                <Button variant="link" className="p-0 mt-4">
                  View All Sermons →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SermonHighlight;