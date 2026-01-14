import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Cross,
  FileText,
  Play,
  Download,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  BookOpen,
  Video,
  Image as ImageIcon,
  DollarSign,
  UserPlus,
  HandHeart,
  Music,
  Eye,
  Church,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/home/HeroSection";
import LatestNews from "@/components/home/LatestNews";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import SermonHighlight from "@/components/home/SermonHighlight";
import MinistriesSection from "@/components/home/MinistriesSection";
import CatholicDailyReadings from "@/components/home/CatholicDailyReadings";
import bannerPhoto from "@/assets/images/church_banner.jpg";
import stAnthony from "@/assets/images/st_anthony.png";

// Mock data interfaces
interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  thumbnail: string;
  duration: string;
}

interface Group {
  id: string;
  name: string;
  category: string;
  summary: string;
  logo: string;
}

interface Bulletin {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
}

interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  title: string;
}

const Landing = () => {
  useEffect(() => {
    document.title = "Welcome to St. Anthony Catholic Church, Gbaja | Home";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Welcome to St. Anthony Catholic Church, Gbaja. Join us for Mass, explore our ministries, watch sermons, and connect with our vibrant Catholic community."
      );
    }
  }, []);

  // Fetch latest sermons
  const { data: latestSermons = [] } = useQuery<Sermon[]>({
    queryKey: ["latest-sermons"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        {
          id: "1",
          title: "Walking in Faith",
          speaker: "Rev. Fr. Bernard Okodua",
          date: "November 10, 2024",
          thumbnail: bannerPhoto,
          duration: "38:45",
        },
        {
          id: "2",
          title: "The Power of Prayer",
          speaker: "Rev. Fr. Alexander Fatimehin",
          date: "November 3, 2024",
          thumbnail: bannerPhoto,
          duration: "42:15",
        },
        {
          id: "3",
          title: "Living with Purpose",
          speaker: "Rev. Fr. Augustine A",
          date: "October 27, 2024",
          thumbnail: bannerPhoto,
          duration: "35:20",
        },
      ];
    },
  });

  // Fetch featured groups
  const { data: featuredGroups = [] } = useQuery<Group[]>({
    queryKey: ["featured-groups"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        {
          id: "1",
          name: "Catholic Women Organization (CWO)",
          category: "Lay Organizations",
          summary: "Bringing together Catholic women for spiritual growth and community service.",
          logo: bannerPhoto,
        },
        {
          id: "2",
          name: "Catholic Men Organization (CMO)",
          category: "Lay Organizations",
          summary: "Fostering spiritual brotherhood among Catholic men in the parish.",
          logo: bannerPhoto,
        },
        {
          id: "3",
          name: "Legion of Mary",
          category: "Pious Societies",
          summary: "A lay Catholic organization dedicated to serving the Church and spreading the Gospel.",
          logo: bannerPhoto,
        },
        {
          id: "4",
          name: "Catholic Youth Organization (CYON)",
          category: "Youth Groups",
          summary: "Empowering young Catholics to grow in faith and serve their community.",
          logo: bannerPhoto,
        },
      ];
    },
  });

  // Fetch latest bulletin
  const { data: latestBulletin } = useQuery<Bulletin>({
    queryKey: ["latest-bulletin"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: "1",
        title: "Weekly Bulletin - January 14, 2024",
        date: "January 14, 2024",
        thumbnail: bannerPhoto,
      };
    },
  });

  // Fetch gallery items
  const { data: galleryItems = [] } = useQuery<GalleryItem[]>({
    queryKey: ["gallery-items"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        { id: "1", type: "image", url: bannerPhoto, thumbnail: bannerPhoto, title: "Church Service" },
        { id: "2", type: "image", url: stAnthony, thumbnail: stAnthony, title: "Parish Event" },
        { id: "3", type: "image", url: bannerPhoto, thumbnail: bannerPhoto, title: "Community Gathering" },
        { id: "4", type: "image", url: stAnthony, thumbnail: stAnthony, title: "Youth Activity" },
        { id: "5", type: "image", url: bannerPhoto, thumbnail: bannerPhoto, title: "Mass Celebration" },
        { id: "6", type: "image", url: stAnthony, thumbnail: stAnthony, title: "Ministry Meeting" },
      ];
    },
  });

  const navigate = useNavigate();

  const quickToolClicked = (tool: string) => {
    console.log(`${tool} clicked`);
    if (tool) {
      switch (tool) {
        case "register":
          navigate("/register");
          break;
        case "visit":
          navigate("/visit");
          break;
        case "book-mass":
          navigate("/book-mass");
          break;
        case "request-sacrament":
          navigate("/request-sacrament");
          break;
        case "join-group":
          break;
        case "support":
          navigate("/support");
          break;
        default:
          console.log(`${tool} not found`);
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Wave Divider (Hero -> Welcome) */}
      {/* This SVG overlaps the bottom of the Hero video and "wipes" into the Welcome section */}
      <div className="relative h-16 md:h-24 lg:h-28 -mt-12 md:-mt-24 lg:-mt-28 sm:mt-10 overflow-hidden pointer-events-none">
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-background"
        >
          {/* Filled wave uses currentColor (mapped to Tailwind `text-background`) */}
          <path
            d="M0,64 C200,0 400,128 600,64 C800,0 1000,128 1200,64 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Quick Tools Section */}
      <section className="py-16 pt-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              St. Anthony Catholic Church, Gbaja.
            </h2>
            {/* A very warm and short welcome message */}
            <p className="text-xl text-muted-foreground mb-8">
              A community of Catholic believers passionate about Jesus and committed to sharing His love.
              Whether you're exploring faith for the first time or looking for a church home,
              you'll find a warm welcome here.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12">
              {/* Register */}
              <Card className="p-6 text-center hover:shadow-lg transition-shadow border border-primary rounded-lg cursor-pointer" onClick={() => quickToolClicked("register")}>
                <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Register</h3>
              </Card>
              {/* Attend Mass */}
              <Card className="p-6 text-center hover:shadow-lg transition-shadow border border-primary rounded-lg cursor-pointer" onClick={() => quickToolClicked("visit")}>
                <Church className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Attend Mass</h3>
              </Card>
              {/* Request Mass */}
              <Card className="p-6 text-center hover:shadow-lg transition-shadow border border-primary rounded-lg cursor-pointer" onClick={() => quickToolClicked("book-mass")}>
                <HandHeart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Book Mass</h3>
              </Card>
              {/* Confessions */}
              <Card className="p-6 text-center hover:shadow-lg transition-shadow border border-primary rounded-lg cursor-pointer" onClick={() => quickToolClicked("request-sacrament")}>
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Request Sacrament</h3>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow border border-primary rounded-lg cursor-pointer" onClick={() => quickToolClicked("join-group")}>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Join Group</h3>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow border border-primary rounded-lg cursor-pointer" onClick={() => quickToolClicked("support")}>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Support</h3>
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
      {/* Welcome Section */}
      {/* <section className="py-16 pt-10 bg-background">
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
                  Sunday: 7:00 AM, 8:30 AM, 10:00 AM, 11:30 AM, & 6:00 PM
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">
                  123 Gbaja Street<br />Surulere, Lagos
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
      </section> */}

      {/* Latest News and Events */}
      <LatestNews />
      <UpcomingEvents />

      {/* Latest Sermons */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Latest Sermons
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch and listen to inspiring messages from our priests and guest speakers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestSermons.map((sermon) => (
              <Card key={sermon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={sermon.thumbnail}
                    alt={sermon.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2 text-church-charcoal">
                    {sermon.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>{sermon.speaker}</span>
                    <span>•</span>
                    <span>{sermon.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{sermon.duration}</span>
                  </div>
                  <Link to={`/sermons/${sermon.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Watch Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/sermons">
              <Button variant="church" size="lg">
                View All Sermons
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Groups and Societies */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Featured Groups & Societies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our vibrant community of organizations and ministries serving the parish.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted mb-4">
                    <img
                      src={group.logo}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge variant="secondary" className="mb-2">
                    {group.category}
                  </Badge>
                  <CardTitle className="text-lg leading-tight">{group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{group.summary}</p>
                  <Link to={`/groups#${group.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/groups">
              <Button variant="church" size="lg">
                View All Groups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Readings, Bible Verses, and Reflections */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Daily Spiritual Nourishment
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Feed your soul with daily readings, Bible verses, prayers, and reflections.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Daily Readings</h3>
              <p className="text-muted-foreground mb-4">
                Read the daily Mass readings and reflect on God's word.
              </p>
              <CatholicDailyReadings />
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Daily Prayer</h3>
              <p className="text-muted-foreground mb-4">
                "Pray without ceasing" - Join us in daily prayer for our community and the world.
              </p>
              <Link to="/prayer-requests">
                <Button variant="outline" size="sm">
                  Submit Prayer Request
                </Button>
              </Link>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Reflections & Homilies</h3>
              <p className="text-muted-foreground mb-4">
                Deepen your faith with thoughtful reflections and homilies from our priests.
              </p>
              <Link to="/sermons">
                <Button variant="outline" size="sm">
                  Read Reflections
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Parish Anthem */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
                Parish Anthem
              </h2>
              <p className="text-lg text-muted-foreground">
                Listen to and learn our parish anthem that unites us in worship.
              </p>
            </div>
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Music className="h-8 w-8 text-primary" />
                    <h3 className="text-2xl font-heading font-semibold">St. Anthony Parish Anthem</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Our parish anthem reflects our identity as a community of faith, love, and service.
                    Join us in singing this beautiful hymn that celebrates our unity in Christ.
                  </p>
                  <Link to="/parish-anthem">
                    <Button variant="church" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Listen & Learn
                    </Button>
                  </Link>
                </div>
                <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted">
                  <img src={stAnthony} alt="Parish Anthem" className="w-full h-full object-cover" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Mass and Confessions Schedule */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Mass & Confessions Schedule
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join us for Holy Mass and the Sacrament of Reconciliation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Cross className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-heading font-bold">Mass Schedule</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Sunday Mass</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>7:00 AM</p>
                    <p>8:30 AM</p>
                    <p>10:00 AM</p>
                    <p>11:30 AM</p>
                    <p>6:00 PM</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-2">Weekday Mass</p>
                  <p className="text-muted-foreground">Monday - Friday: 6:30 AM</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-2">Thursday Faith & Doctrinal Class</p>
                  <p className="text-muted-foreground">7:00 PM</p>
                </div>
              </div>
            </Card>
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-heading font-bold">Confessions</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Regular Confession Times</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Saturday: 5:00 PM - 6:00 PM</p>
                    <p>Before Mass: By appointment</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-2">Special Confession Times</p>
                  <p className="text-muted-foreground">
                    During Advent and Lent seasons, additional times are available. Please check the bulletin
                    for updates.
                  </p>
                </div>
                <Link to="/visit">
                  <Button variant="outline" className="w-full mt-4">
                    Plan Your Visit
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Weekly Bulletin */}
      {latestBulletin && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
                Latest Weekly Bulletin
              </h2>
              <p className="text-lg text-muted-foreground">
                Stay informed with our weekly bulletin featuring news, events, and announcements.
              </p>
            </div>
            <Card className="max-w-4xl mx-auto hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative">
                  <img
                    src={latestBulletin.thumbnail}
                    alt={latestBulletin.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{latestBulletin.date}</span>
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-3 text-church-charcoal">
                      {latestBulletin.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Stay informed with the latest news and updates from our church community, including
                      upcoming events, recent activities, and important announcements.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/weekly-bulletin">
                      <Button variant="church" size="lg">
                        <Download className="h-4 w-4 mr-2" />
                        Download Bulletin
                      </Button>
                    </Link>
                    <Link to="/weekly-bulletin">
                      <Button variant="outline" size="lg">
                        View All Bulletins
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Parish Priest Welcome Note */}
      <section className="py-16 bg-church-pearl font-serif">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              A Message from Our Parish Priest
            </h2>
            <Card className="p-8 bg-white/50">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                "Welcome to St. Anthony, Gbaja! It is my joy and privilege to serve as your parish priest.
                Our church is a place where faith is nurtured, lives are transformed, and God's love is shared.
                I invite you to join us in worship, fellowship, and service as we grow together in Christ.
                Whether you are a longtime member or visiting for the first time, know that you are welcome
                here. Let us journey together in faith, hope, and love."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-church flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-church-charcoal">
                    Very. Rev. Msgr. Bernard Okodua
                  </p>
                  <p className="text-muted-foreground">Parish Priest</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media Links and CTAs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Stay Connected
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow us on social media and stay updated with our latest news and events.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-8 w-8 text-primary-foreground" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-8 w-8 text-primary-foreground" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Subscribe to our YouTube channel"
            >
              <Youtube className="h-8 w-8 text-primary-foreground" />
            </a>
            <a
              href="mailto:info@stanthonygbaja.org"
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Send us an email"
            >
              <Mail className="h-8 w-8 text-primary-foreground" />
            </a>
          </div>
          <div className="text-center">
            <Link to="/contact">
              <Button variant="church" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Watch Live Streaming */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
                Watch Live
              </h2>
              <p className="text-lg text-muted-foreground">
                Join us for live Mass and special events from anywhere in the world.
              </p>
            </div>
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-4">Live streaming will appear here</p>
                    <Link to="/live">
                      <Button variant="church" size="lg">
                        <Eye className="h-4 w-4 mr-2" />
                        Go to Live Stream
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Sunday Mass Live</h3>
                    <p className="text-sm text-muted-foreground">
                      Every Sunday at 10:00 AM and 6:00 PM
                    </p>
                  </div>
                  <Link to="/live">
                    <Button variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Photo & Video Gallery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore moments from our church community, events, and celebrations.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {galleryItems.slice(0, 8).map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative aspect-square">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.type === "video" ? (
                      <Play className="h-12 w-12 text-white" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-white" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/gallery">
              <Button variant="church" size="lg">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Donations */}
      <section className="py-16 bg-gradient-church">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <DollarSign className="h-16 w-16 text-church-charcoal mx-auto mb-6" />
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4">
              Support Our Parish
            </h2>
            <p className="text-lg text-church-charcoal/80 mb-8">
              Your generous donations help us continue our mission of serving the community, supporting
              charitable causes, and maintaining our church facilities. Every contribution makes a difference.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-white/90">
                <h3 className="text-xl font-heading font-semibold mb-3">Charity & Outreach</h3>
                <p className="text-muted-foreground mb-4">
                  Support our charitable programs that help those in need in our community.
                </p>
                <Link to="/charity">
                  <Button variant="secondary" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </Card>
              <Card className="p-6 bg-white/90">
                <h3 className="text-xl font-heading font-semibold mb-3">Parish Support</h3>
                <p className="text-muted-foreground mb-4">
                  Help maintain our church facilities and support our ministries and programs.
                </p>
                <Link to="/donations">
                  <Button variant="secondary" className="w-full">
                    Donate Now
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Get Involved
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              There are many ways to connect with our parish community and grow in your faith.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Book Mass</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Request a Mass intention for your loved ones or special occasions.
              </p>
              <Link to="/book-mass">
                <Button variant="outline" size="sm" className="w-full">
                  Book Now
                </Button>
              </Link>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <HandHeart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Request Prayer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit a prayer request and our community will pray for your intentions.
              </p>
              <Link to="/prayer-requests">
                <Button variant="outline" size="sm" className="w-full">
                  Submit Request
                </Button>
              </Link>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Join a Group</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with ministries and societies that match your interests and calling.
              </p>
              <Link to="/groups">
                <Button variant="outline" size="sm" className="w-full">
                  Explore Groups
                </Button>
              </Link>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Become a Member</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Register as a parish member and access exclusive resources and services.
              </p>
              <Link to="/registration">
                <Button variant="outline" size="sm" className="w-full">
                  Register Now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to Visit?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We'd love to meet you! Join us this Sunday and experience the warmth of our church family.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/visit">
              <Button variant="church" size="xl">
                Plan Your Visit
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="xl">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
