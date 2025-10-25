import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin, ArrowRight, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import bannerPhoto from "@/assets/images/church_banner.jpg";

const News = () => {

    return (
        <div>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">
                        News & Updates
                    </h1>
                    <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
                        Stay updated with the latest news, events, and announcements from our church community.
                    </p>
                </div>
            </section>

            {/* News Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <p className="text-muted-foreground mb-8 text-center">
                        Explore our news section to stay informed about recent happenings, upcoming events, and important announcements within our church community.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="hover:shadow-xl transition-shadow">
                            <CardHeader>
                                {/* Photo */}
                                <img
                                src={bannerPhoto}
                                alt="News Image 1"
                                className="w-full h-48 object-cover"
                            />
                                {/* Title */}
                                <CardTitle>
                                    Exciting Updates from Our Church Community
                                </CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                        Admin
                                    </span>
                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                        Dec 1, 2024
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Stay informed with the latest news and updates from our church community, including upcoming events, recent activities, and important announcements.
                                </p>
                                <Button variant="link" className="p-0 group">
                                    Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-xl transition-shadow">
                            <CardHeader>
                                {/* Photo */}
                                <img
                                src={bannerPhoto}
                                alt="News Image 2"
                                className="w-full h-48 object-cover"
                            />
                                {/* Title */}
                                <CardTitle>
                                    Community Outreach Program Success
                                </CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                        Admin
                                    </span>
                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                        Nov 20, 2024
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Our recent community outreach program was a great success, thanks to the dedication and support of our church members and volunteers.
                                </p>
                                <Button variant="link" className="p-0 group">
                                    Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-xl transition-shadow">
                            <CardHeader>
                                {/* Photo */}
                                <img
                                src={bannerPhoto}
                                alt="News Image 3"
                                className="w-full h-48 object-cover"
                            />
                                {/* Title */}
                                <CardTitle>
                                    Upcoming Holiday Events at Our Church
                                </CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center"><User className="h-3 w-3 mr-1" />
                                        Admin
                                    </span>
                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />
                                        Nov 10, 2024
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Join us for our special holiday events this season, including festive services, community gatherings, and opportunities to give back.
                                </p>
                                <Button variant="link" className="p-0 group">
                                    Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-church text-church-charcoal">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-heading font-bold mb-4">Stay Connected</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Subscribe to our newsletter to receive the latest news and updates directly in your inbox.
                    </p>
                    <Link to="/subscribe" className="inline-block">
                        <Button variant="church" size="lg" className="flex items-center gap-2">
                            Subscribe Now <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default News;