import { useState } from "react";
import { Search, Users, Calendar, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "all", name: "All Groups" },
  { id: "pious", name: "Pious Societies" },
  { id: "lay", name: "Lay Organizations" },
  { id: "youth", name: "Youth Groups" },
  { id: "service", name: "Service Groups" },
  { id: "prayer", name: "Prayer Groups" },
];

const groups = [
  {
    id: 1,
    name: "Catholic Women Organization (CWO)",
    category: "lay",
    patronSaint: "Our Lady of Perpetual Help",
    summary: "Bringing together Catholic women for spiritual growth and community service.",
    meetingDay: "2nd Sunday of the Month",
    meetingTime: "After 10am Mass",
    venue: "Parish Hall",
    logo: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100",
  },
  {
    id: 2,
    name: "Catholic Men Organization (CMO)",
    category: "lay",
    patronSaint: "St. Joseph",
    summary: "Fostering spiritual brotherhood among Catholic men in the parish.",
    meetingDay: "1st Sunday of the Month",
    meetingTime: "After 10am Mass",
    venue: "Parish Hall",
    logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100",
  },
  {
    id: 3,
    name: "Legion of Mary",
    category: "pious",
    patronSaint: "Our Lady, Queen of the Legion",
    summary: "A lay Catholic organization dedicated to serving the Church and spreading the Gospel.",
    meetingDay: "Every Thursday",
    meetingTime: "5:00 PM",
    venue: "Legion Room",
    logo: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=100",
  },
  {
    id: 4,
    name: "Catholic Youth Organization (CYON)",
    category: "youth",
    patronSaint: "St. Tarcisius",
    summary: "Empowering young Catholics for leadership and evangelization.",
    meetingDay: "Every Saturday",
    meetingTime: "4:00 PM",
    venue: "Youth Center",
    logo: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=100",
  },
  {
    id: 5,
    name: "Knights of St. Mulumba",
    category: "lay",
    patronSaint: "St. Mulumba",
    summary: "Catholic gentlemen dedicated to charity, unity, and fraternalism.",
    meetingDay: "2nd Thursday of the Month",
    meetingTime: "6:00 PM",
    venue: "Knights Hall",
    logo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
  },
  {
    id: 6,
    name: "Catholic Charismatic Renewal",
    category: "prayer",
    patronSaint: "Holy Spirit",
    summary: "Renewal movement emphasizing personal relationship with Jesus through the Holy Spirit.",
    meetingDay: "Every Wednesday",
    meetingTime: "5:30 PM",
    venue: "Church",
    logo: "https://images.unsplash.com/photo-1544654803-b69140b285a1?w=100",
  },
  {
    id: 7,
    name: "St. Vincent de Paul Society",
    category: "service",
    patronSaint: "St. Vincent de Paul",
    summary: "Serving the poor and marginalized in our community through works of mercy.",
    meetingDay: "Every Tuesday",
    meetingTime: "5:00 PM",
    venue: "SVdP Office",
    logo: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=100",
  },
  {
    id: 8,
    name: "Sacred Heart of Jesus Confraternity",
    category: "pious",
    patronSaint: "Sacred Heart of Jesus",
    summary: "Promoting devotion to the Sacred Heart of Jesus.",
    meetingDay: "1st Friday of the Month",
    meetingTime: "After Evening Mass",
    venue: "Church",
    logo: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=100",
  },
  {
    id: 9,
    name: "Church Choir",
    category: "service",
    patronSaint: "St. Cecilia",
    summary: "Leading the congregation in worship through sacred music.",
    meetingDay: "Every Friday",
    meetingTime: "6:00 PM",
    venue: "Choir Loft",
    logo: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=100",
  },
  {
    id: 10,
    name: "Altar Servers Guild",
    category: "service",
    patronSaint: "St. Tarcisius",
    summary: "Young people serving at the altar during Mass and other liturgical celebrations.",
    meetingDay: "Every Saturday",
    meetingTime: "3:00 PM",
    venue: "Sacristy",
    logo: "https://images.unsplash.com/photo-1545987796-200677ee1011?w=100",
  },
  {
    id: 11,
    name: "Lectors/Readers Ministry",
    category: "service",
    patronSaint: "St. Jerome",
    summary: "Proclaiming the Word of God during liturgical celebrations.",
    meetingDay: "Last Saturday of the Month",
    meetingTime: "10:00 AM",
    venue: "Parish Hall",
    logo: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=100",
  },
  {
    id: 12,
    name: "Block Rosary Group",
    category: "prayer",
    patronSaint: "Our Lady of the Rosary",
    summary: "Promoting family and community prayer through the Holy Rosary.",
    meetingDay: "Monthly rotation",
    meetingTime: "Varies",
    venue: "Members' Homes",
    logo: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=100",
  },
  {
    id: 13,
    name: "Marriage Encounter",
    category: "lay",
    patronSaint: "Holy Family",
    summary: "Strengthening marriages through weekend experiences and ongoing support.",
    meetingDay: "3rd Sunday of the Month",
    meetingTime: "After 8am Mass",
    venue: "Parish Hall",
    logo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=100",
  },
  {
    id: 14,
    name: "Catholic Biblical Association",
    category: "prayer",
    patronSaint: "St. Jerome",
    summary: "Studying and sharing the Word of God through Bible study groups.",
    meetingDay: "Every Thursday",
    meetingTime: "6:00 PM",
    venue: "Library",
    logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100",
  },
  {
    id: 15,
    name: "Ushers/Church Wardens",
    category: "service",
    patronSaint: "St. Michael the Archangel",
    summary: "Ensuring orderly worship and welcoming parishioners at Mass.",
    meetingDay: "2nd Saturday of the Month",
    meetingTime: "4:00 PM",
    venue: "Parish Hall",
    logo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
  },
];

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.patronSaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200"
            alt="Parish Groups"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary/60" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <Badge className="mb-4 bg-primary text-primary-foreground">Community Life</Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-in">
            Groups & <span className="text-primary">Organizations</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto px-4 opacity-90">
            Find your place in our parish family
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search groups, societies, or patron saints..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Groups Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground text-center mb-8">
            {filteredGroups.length} {filteredGroups.length === 1 ? "group" : "groups"} found
          </p>

          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No groups found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => (
                <Card
                  key={group.id}
                  className="group overflow-hidden card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={group.logo}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-2 capitalize">
                          {categories.find((c) => c.id === group.category)?.name}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">{group.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <span className="font-medium">Patron: {group.patronSaint}</span>
                    </div>
                    <CardDescription className="line-clamp-2">{group.summary}</CardDescription>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{group.meetingDay}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{group.meetingTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{group.venue}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Want to <span className="text-primary">Join a Group?</span>
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            Contact the parish office or speak with any group leader after Mass. 
            You can also register online to indicate your interest.
          </p>
          <Button size="lg" variant="church" asChild>
            <a href="/registration">Register as a Parishioner</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Groups;