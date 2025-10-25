import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Charity = () => {

    return (
        <div>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">
                        Support Our Mission
                    </h1>
                    <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
                        Support the church and its mission through your generous giving.
                    </p>
                </div>
            </section>

            {/* Giving Options */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <p className="text-muted-foreground mb-8 text-center">
                        Your generosity enables us to continue our mission and serve our community. Choose a giving option below that works best for you.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <Heart className="h-12 w-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-heading font-semibold mb-2">One-Time Donation</h3>
                            <p className="text-muted-foreground mb-4">Make a single contribution to support our ministries.</p>
                            <Button variant="church" size="lg" className="mt-4">Donate Now</Button>
                        </Card>
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <Users className="h-12 w-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-heading font-semibold mb-2">Recurring Donation</h3>
                            <p className="text-muted-foreground mb-4">Set up a monthly gift to provide ongoing support.</p>
                            <Button variant="church" size="lg" className="mt-4">Set Up Recurring</Button>
                        </Card>
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <Target className="h-12 w-12 text-primary mb-4 mx-auto" />
                            <h3 className="text-xl font-heading font-semibold mb-2">Designated Giving</h3>
                            <p className="text-muted-foreground mb-4">Support a specific ministry or project.</p>
                            <Button variant="church" size="lg" className="mt-4">Give to a Cause</Button>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-r from-primary/10 to-primary-light/10 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-heading font-bold mb-4">Thank You for Your Support</h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                        "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
                    </p>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Your generosity makes a difference in the lives of many. Thank you for partnering with us in ministry.
                    </p>
                </div>
            </section>

        </div>
    );
};

export default Charity;