import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Gallery = () => {

    return (
        <div>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">
                        Our Gallery
                    </h1>
                    <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
                        A glimpse into the life and ministry of our church through photos and memories.
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <p className="text-muted-foreground mb-8 text-center">
                        Explore our gallery to see moments captured from our services, events, and community activities.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src="/api/placeholder/600/400"
                                alt="Gallery Image 1"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Worship Service</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    A vibrant worship service filled with praise and worship.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src="/api/placeholder/600/400"
                                alt="Gallery Image 2"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Community Outreach</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Serving our community through various outreach programs.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src="/api/placeholder/600/400"
                                alt="Gallery Image 3"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Youth Ministry</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Engaging and empowering the next generation through faith.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        {/* Add more gallery cards as needed */}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-16 bg-gradient-church">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4">
                        Want to See More?
                    </h2>
                    <p className="text-lg text-church-charcoal/80 mb-8 max-w-2xl mx-auto">
                        Visit our church to experience the warmth and fellowship of our community in person.
                    </p>
                    <Link to="/visit">
                        <Button variant="church" size="lg" className="group">
                            Plan Your Visit
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Gallery;