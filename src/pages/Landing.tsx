import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Mail, Play, Download, ArrowRight, Image as ImageIcon } from "lucide-react";
import { CandleIcon, ChaliceIcon, ChurchFrontIcon, CoinsIcon, CommunityIcon, HandsIcon, MusicIcon, PriestIcon, PulpitIcon, ReadingsIcon } from "@/components/icons/ParishIcons";
import { Facebook, Instagram, Youtube } from "@/components/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/home/HeroSection";
import LatestNews from "@/components/home/LatestNews";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import MinistriesSection from "@/components/home/MinistriesSection";
import CatholicDailyReadings from "@/components/home/CatholicDailyReadings";
import MassLivestreamBanner from "@/components/home/MassLivestreamBanner";
import MassConfessionsSection from "@/components/home/MassConfessionsSection";
import QuickAccessSection from "@/components/home/QuickAccessSection";
import SocialPlatforms from "@/components/home/SocialPlatforms";
import WhatsAppCommunitySection from "@/components/home/WhatsAppCommunitySection";
import GivingCategorySlider from "@/components/home/GivingCategorySlider";
import bannerPhoto from "@/assets/images/st_anthony.webp";
import stAnthony from "@/assets/images/st_anthony.webp";
import FloatingSocial from "@/components/parish-home/FloatingSocial";
import Voices from "@/components/parish-home/Voices";
import VisitStrip from "@/components/parish-home/VisitStrip";
import sermonService from "@/services/sermon.service";
import { formatSermonDate, sermonThumbnail } from "@/components/sermons/sermonMedia";

// Mock data interfaces

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

  // Fetch latest sermons (used when Latest Sermons section is enabled)
  const { data: latestSermons = [] } = useQuery({
    queryKey: ["sermons", "latest", 3],
    queryFn: () => sermonService.getLatest({ limit: 3 }),
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
        { id: "1", type: "image", url: bannerPhoto, thumbnail: bannerPhoto, title: "Sunday Mass" },
        { id: "2", type: "image", url: stAnthony, thumbnail: stAnthony, title: "Parish Event" },
        { id: "3", type: "image", url: bannerPhoto, thumbnail: bannerPhoto, title: "Community Gathering" },
        { id: "4", type: "image", url: stAnthony, thumbnail: stAnthony, title: "Youth Activity" },
        { id: "5", type: "image", url: bannerPhoto, thumbnail: bannerPhoto, title: "Mass Celebration" },
        { id: "6", type: "image", url: stAnthony, thumbnail: stAnthony, title: "Ministry Meeting" },
      ];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Wave Divider (Hero -> Quick Access) — cream wipe into the redesigned section */}
      <div className="relative -mt-12 h-16 overflow-hidden pointer-events-none sm:mt-10 md:-mt-24 md:h-24 lg:-mt-28 lg:h-28">
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-church-ivory"
        >
          <path
            d="M0,64 C200,0 400,128 600,64 C800,0 1000,128 1200,64 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <QuickAccessSection />
      <FloatingSocial />

      <MassLivestreamBanner />

      <Voices />

      <MassConfessionsSection />

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
            <Button variant="church" size="lg" className="group" asChild>
              <Link to="/about">
                Learn More About Us
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Latest News and Events */}
      {/* <LatestNews /> */}
      <UpcomingEvents />

      <WhatsAppCommunitySection />

      <SocialPlatforms>
        <div className="mt-10 text-center">
          <Button variant="church" size="lg" asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </SocialPlatforms>


      {/* Donations */}
      <section className="py-16 bg-gradient-church">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <CoinsIcon className="mx-auto mb-6 h-16 w-16" />
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4">
              Support Our Parish
            </h2>
            <p className="text-lg text-church-charcoal/80">
              Your generous donations help us continue our mission of serving the community, supporting
              charitable causes, and maintaining our church facilities. Every contribution makes a difference.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-6xl">
            <GivingCategorySlider />
          </div>
          {/* Black Background Gold Text Action Button */}
          <div className="text-center mt-8">
            <Button variant="church" size="lg" className="bg-church-charcoal text-church-gold-warm">
              <Link to="/donations">
                Donate Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Sermons — enable when desired; data is live via sermonService.getLatest */}
      {/* <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
              Latest Sermons
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch and listen to homilies and reflections from our parish clergy.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestSermons.map((sermon) => (
              <Card key={sermon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={sermonThumbnail(sermon) || bannerPhoto}
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
                    <span>{formatSermonDate(sermon.preached_date || sermon.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{sermon.duration}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/sermons?sermon=${encodeURIComponent(sermon.slug)}`}>
                      Watch Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="church" size="lg" asChild>
              <Link to="/sermons">
                View All Sermons
              </Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Featured Groups and Societies */}
      {/* <section className="py-16 bg-background">
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
                    <img loading="lazy" decoding="async"
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
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/groups#${group.id}`}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="church" size="lg" asChild>
              <Link to="/groups">
                View All Groups
              </Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Daily Readings, Bible Verses, and Reflections */}
      {/* <section className="py-16 bg-church-pearl">
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
              <ReadingsIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Daily Readings</h3>
              <p className="text-muted-foreground mb-4">
                Read the daily Mass readings and reflect on God's word.
              </p>
              <CatholicDailyReadings />
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CandleIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Daily Prayer</h3>
              <p className="text-muted-foreground mb-4">
                "Pray without ceasing" - Join us in daily prayer for our community and the world.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/prayer-requests">
                  Submit Prayer Request
                </Link>
              </Button>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <PulpitIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Reflections & Homilies</h3>
              <p className="text-muted-foreground mb-4">
                Deepen your faith with thoughtful reflections and homilies from our priests.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/sermons">
                  Read Reflections
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Parish Anthem */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
                Parish Anthem
              </h2>
              {/* <p className="text-lg text-muted-foreground">
                Listen to and learn our parish anthem that unites us in worship.
              </p> */}
            </div>
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <MusicIcon className="h-10 w-10" />
                    <h3 className="text-2xl font-heading font-semibold">St. Anthony Parish Anthem</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Our parish anthem reflects our identity as a community of faith, love, and service.
                    Join us in singing this beautiful hymn that celebrates our unity in Christ.
                  </p>
                  <Button variant="church" size="lg" asChild>
                    <Link to="/parish-anthem">
                      <Play className="h-4 w-4 mr-2" />
                      Listen & Learn
                    </Link>
                  </Button>
                </div>
                <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted">
                  <img loading="lazy" decoding="async" src={stAnthony} alt="Painting of St. Anthony of Padua holding the Child Jesus" className="w-full h-full object-cover" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>



      {/* Latest Weekly Bulletin */}
      {/* {latestBulletin && (
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
                  <img loading="lazy" decoding="async"
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
                    <Button variant="church" size="lg" asChild>
                      <Link to="/weekly-bulletin">
                        <Download className="h-4 w-4 mr-2" />
                        Download Bulletin
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/weekly-bulletin">
                        View All Bulletins
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )} */}

      {/* Parish Priest Welcome Note */}
      {/* <section className="py-16 bg-church-pearl font-serif">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              A Message from Our Parish Priest
            </h2>
            <Card className="p-8 bg-white/50">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                "Welcome to St. Anthony Catholic Church, Gbaja! It is my joy and privilege to serve as your parish priest.
                Our parish is a place where faith is nurtured, lives are transformed, and God's love is shared.
                I invite you to join us for Mass, fellowship, and works of charity as we grow together in Christ.
                Whether you are a longtime member or visiting for the first time, know that you are welcome
                here. Let us journey together in faith, hope, and love."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-church flex items-center justify-center">
                  <PriestIcon framed={false} className="h-10 w-10" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-church-charcoal">
                    Very Rev. Fr. Sylvester Tolulope Oladunjoye
                  </p>
                  <p className="text-muted-foreground">Parish Priest</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Social Media Links and CTAs */}
      {/* <section className="py-16 bg-background">
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
            <Button variant="church" size="lg" asChild>
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section> */}


      {/* Gallery */}
      {/* <section className="py-16 bg-background">
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
                  <img loading="lazy" decoding="async"
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
            <Button variant="church" size="lg" asChild>
              <Link to="/gallery">
                View Full Gallery
              </Link>
            </Button>
          </div>
        </div>
      </section> */}


      {/* Call to Action Section */}
      {/* <section className="py-16 bg-background">
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
              <ChurchFrontIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Book Mass</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Request a Mass intention for your loved ones or special occasions.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/book-mass">
                  Book Now
                </Link>
              </Button>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <HandsIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Request Prayer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit a prayer request and our community will pray for your intentions.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/prayer-requests">
                  Submit Request
                </Link>
              </Button>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CommunityIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Join a Group</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with ministries and societies that match your interests and calling.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/groups">
                  Explore Groups
                </Link>
              </Button>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <ChaliceIcon size="md" className="mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">Become a Member</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Register as a parish member and access exclusive resources and services.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/registration">
                  Register Now
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section> */}


      <VisitStrip />

      {/* Final CTA */}
      {/* <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to Visit?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We'd love to meet you! Join us this Sunday and experience the warmth of our church family.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="church" size="xl" asChild>
              <Link to="/visit">
                Plan Your Visit
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Landing;
