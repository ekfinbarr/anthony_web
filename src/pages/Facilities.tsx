import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import stAnthony from "@/assets/images/st_anthony.png";

const Facilities = () => {

    return (
        <div>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">Our Facilities</h1>
                    <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
                        Explore our beautiful spaces where we gather to worship, learn, and serve
                    </p>
                </div>
            </section>

            {/* Our facilities in picture previews and click to view button */}
            {/* 
            - Event Hall
            - Books and Sacramentary Shop
            - Meeting & Conference Rooms
            - Medical Clinic
            - Parking Area
            - Toilets & Restrooms
            */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <p className="text-muted-foreground mb-8 text-center">
                        We offer a range of facilities to support our ministry and serve our community.
                    </p>
                    {/* Facilities Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={stAnthony}
                                alt="Event Hall"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Event Hall</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    A spacious hall for weddings, conferences, and community events.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={stAnthony}
                                alt="Books and Sacramentary Shop"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Books and Sacramentary Shop</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Find spiritual books, Bibles, and sacramentaries for all occasions.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={stAnthony}
                                alt="Meeting & Conference Rooms"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Meeting & Conference Rooms</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Equipped rooms for small groups, Bible studies, and church meetings.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={stAnthony}
                                alt="Medical Clinic"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Medical Clinic</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Providing basic health services to our congregation and community.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={stAnthony}
                                alt="Parking Area"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Parking Area</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ample parking space for members and visitors.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={stAnthony}
                                alt="Toilets & Restrooms"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-2xl font-heading font-bold mb-2">Toilets & Restrooms</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Clean and accessible facilities for all attendees.
                                </p>
                                <Button variant="outline" size="sm">
                                    View Gallery
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Service Times */}
            <section id="services" className="py-16 bg-gradient-church">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-heading font-serif font-bold text-center mb-12 text-church-charcoal">
                        Kindly reach out to us for more information.
                    
                    </h2>
                    <div className="text-center mt-8">
                        <Link to="/contact" className="inline-block">
                            <Button variant="secondary" size="xl">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Facilities;