import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinsIcon, CompassIcon, GiftIcon } from "@/components/icons/ParishIcons";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";

const Charity = () => {

    return (
        <div>
            <PageHeader
                title="Support Our Mission"
                description="Support the church and its mission through your generous giving."
            />

            {/* Giving Options */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <p className="text-muted-foreground mb-8 text-center">
                        Your generosity enables us to continue our mission and serve our community. Choose a giving option below that works best for you.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <GiftIcon size="md" className="mx-auto mb-4" />
                            <h3 className="text-xl font-heading font-semibold mb-2">One-Time Donation</h3>
                            <p className="text-muted-foreground mb-4">Make a single contribution to support our ministries.</p>
                            <Button variant="church" size="lg" className="mt-4">Donate Now</Button>
                        </Card>
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <CoinsIcon size="md" className="mx-auto mb-4" />
                            <h3 className="text-xl font-heading font-semibold mb-2">Recurring Donation</h3>
                            <p className="text-muted-foreground mb-4">Set up a monthly gift to provide ongoing support.</p>
                            <Button variant="church" size="lg" className="mt-4">Set Up Recurring</Button>
                        </Card>
                        <Card className="p-6 hover:shadow-xl transition-shadow text-center">
                            <CompassIcon size="md" className="mx-auto mb-4" />
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