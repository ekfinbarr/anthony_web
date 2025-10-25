import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import bannerPhoto from '@/assets/images/church_banner.jpg';

const Bulletin = () => {

    return (
        <div>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">
                        Bulletin
                    </h1>
                    <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
                        Stay updated with the latest news, events, and announcements from our church community.
                    </p>
                </div>
            </section>

            {/* Latest Bulletin Preview in big card, other bulletins (past bulletins) with preview thumbnails with date */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <p className="text-muted-foreground mb-8 text-center">
                        Explore our bulletin to stay informed about recent happenings, upcoming events, and important announcements within our church community.
                    </p>
                    <Card className="hover:shadow-xl transition-shadow">
                        <div className="grid md:grid-cols-2">
                            <img
                                src="/api/placeholder/800/600"
                                alt="Latest Bulletin"
                                className="w-full h-64 object-cover md:h-auto"
                            />
                            <div className="p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-3xl font-heading font-bold mb-2">Weekly Bulletin - January 14, 2024</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Stay informed with the latest news and updates from our church community, including upcoming events, recent activities, and important announcements.
                                    </p>
                                </div>
                                <Button variant="church" size="lg" className="mt-4 self-start">
                                    Download Bulletin
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
            <section className="py-8 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-heading font-bold mb-6 text-center">
                        Past Bulletins
                    </h2>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <Card key={num} className="hover:shadow-lg transition-shadow">
                                <img
                                    src={bannerPhoto}
                                    alt={`Bulletin ${num}`}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-xl font-heading font-semibold mb-2">Bulletin - January {7 - num}, 2024</h3>
                                    <Button variant="outline" size="sm">
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Cards Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-heading font-bold mb-6 text-center">
                        More Ways to Stay Connected
                    </h2>
                    <p className="text-muted-foreground mb-8 text-center">
                        Our weekly bulletin provides important information about upcoming events, service times, and ways to get involved.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <Heart className="h-12 w-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-heading font-semibold mb-2">Weekly Bulletin</h3>
                            <p className="text-muted-foreground mb-4">Download our latest weekly bulletin to stay informed.</p>
                            <Button variant="church" size="lg" className="mt-4">Download Now</Button>
                        </Card>
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <Users className="h-12 w-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-heading font-semibold mb-2">Monthly Newsletter</h3>
                            <p className="text-muted-foreground mb-4">Subscribe to our monthly newsletter for in-depth updates.</p>
                            <Button variant="church" size="lg" className="mt-4">Subscribe</Button>
                        </Card>
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <Target className="h-12 w-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-heading font-semibold mb-2">Event Calendar</h3>
                            <p className="text-muted-foreground mb-4">View our event calendar to see upcoming activities and services.</p>
                            <Link to="/events" className="inline-block">
                                <Button variant="church" size="lg" className="mt-4">View Calendar</Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-r from-primary/10 to-primary-light/10 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-heading font-bold mb-4">Stay Connected</h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom." - Colossians 3:16
                    </p>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Our bulletin is a great way to stay connected with our church community. Don't miss out on important announcements and opportunities to get involved.
                    </p>
                    <Link to="/contact" className="inline-block">
                        <Button variant="secondary" size="lg">
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Bulletin;