import { useState } from "react";
import { Play, Headphones, FileText, Search, Calendar, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Sermons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("all");
  const [selectedSpeaker, setSelectedSpeaker] = useState("all");

  const sermons = [
    {
      id: 1,
      title: "Walking in Faith",
      speaker: "Pastor John Smith",
      date: "November 10, 2024",
      series: "Faith Journey",
      description: "Discover how to strengthen your faith and trust in God's promises.",
      duration: "38:45",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "#",
      audioUrl: "#",
      notesUrl: "#",
    },
    {
      id: 2,
      title: "The Power of Prayer",
      speaker: "Pastor John Smith",
      date: "November 3, 2024",
      series: "Faith Journey",
      description: "Learn how prayer transforms our lives and connects us with God.",
      duration: "42:15",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "#",
      audioUrl: "#",
      notesUrl: "#",
    },
    {
      id: 3,
      title: "Living with Purpose",
      speaker: "Sarah Johnson",
      date: "October 27, 2024",
      series: "Purpose Driven",
      description: "Understanding God's purpose for your life and how to fulfill it.",
      duration: "35:20",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "#",
      audioUrl: "#",
      notesUrl: "#",
    },
    {
      id: 4,
      title: "God's Unfailing Love",
      speaker: "Pastor John Smith",
      date: "October 20, 2024",
      series: "Love & Grace",
      description: "Experience the depth of God's love and how it changes everything.",
      duration: "40:10",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "#",
      audioUrl: "#",
      notesUrl: "#",
    },
  ];

  const series = ["Faith Journey", "Purpose Driven", "Love & Grace"];
  const speakers = ["Pastor John Smith", "Sarah Johnson", "Michael Davis"];

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sermon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeries = selectedSeries === "all" || sermon.series === selectedSeries;
    const matchesSpeaker = selectedSpeaker === "all" || sermon.speaker === selectedSpeaker;
    return matchesSearch && matchesSeries && matchesSpeaker;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-dark text-church-pearl">
        <div className="absolute inset-0 pattern-geometric" />
        <div className="container mx-auto px-4 relative">
          <h1 className="text-5xl font-heading font-bold mb-4 text-center">Sermons</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
            Watch, listen, and grow with our message library
          </p>
        </div>
      </section>

      {/* Featured Sermon */}
      <section className="py-8 bg-gradient-church">
        <div className="container mx-auto px-4">
          <div className="bg-background rounded-lg p-6 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative group">
                <img 
                  src={sermons[0].thumbnail} 
                  alt={sermons[0].title}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 bg-church-charcoal/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="church" size="icon" className="h-16 w-16 rounded-full">
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-primary uppercase">Latest Message</span>
                <h2 className="text-3xl font-heading font-bold mt-2 mb-4">{sermons[0].title}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center"><User className="h-4 w-4 mr-1" /> {sermons[0].speaker}</span>
                  <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {sermons[0].date}</span>
                </div>
                <p className="text-muted-foreground mb-6">{sermons[0].description}</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="church" size="lg">
                    <Play className="mr-2 h-5 w-5" /> Watch Now
                  </Button>
                  <Button variant="outlineGold" size="lg">
                    <Headphones className="mr-2 h-5 w-5" /> Listen
                  </Button>
                  <Button variant="outline" size="lg">
                    <FileText className="mr-2 h-5 w-5" /> Notes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search and Filters */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sermons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                <SelectTrigger>
                  <SelectValue placeholder="All Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {series.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                <SelectTrigger>
                  <SelectValue placeholder="All Speakers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Speakers</SelectItem>
                  {speakers.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </div>

            {/* Sermons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSermons.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative group">
                    <img 
                      src={sermon.thumbnail} 
                      alt={sermon.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-church-charcoal/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="church" size="icon" className="h-12 w-12 rounded-full">
                        <Play className="h-6 w-6 ml-0.5" />
                      </Button>
                    </div>
                    <span className="absolute top-2 right-2 bg-church-charcoal/80 text-church-pearl text-xs px-2 py-1 rounded">
                      {sermon.duration}
                    </span>
                  </div>
                  <CardHeader className="pb-3">
                    <h3 className="font-heading font-semibold text-lg">{sermon.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{sermon.speaker}</span>
                      <span>{sermon.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{sermon.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        {sermon.series}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Headphones className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Sermons
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Series */}
      <section className="py-12 bg-church-pearl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Current Series</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {series.map((s) => (
              <Card key={s} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <img 
                  src="/api/placeholder/400/200" 
                  alt={s}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-lg">{s}</h3>
                  <p className="text-sm text-muted-foreground">4 Messages</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sermons;