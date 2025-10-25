import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, Clock, MapPin, Bus, Car, Baby } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Contact from '../../../Gbaja/src/pages/Contact';

const Visit = () => {
    const values = [
        {
            icon: Heart,
            title: "Love",
            description: "We believe in showing God's love through our actions and relationships.",
        },
        {
            icon: Users,
            title: "Community",
            description: "We value authentic relationships and doing life together.",
        },
        {
            icon: Target,
            title: "Purpose",
            description: "We help people discover and fulfill their God-given purpose.",
        },
    ];

    const leadership = [
        {
      name: "Very. Rev. Msgr. Bernard Okodua",
      role: "Parish Priest",
      bio: "Msgr. Okodua has been serving St. Anthony, Gbaja for over 18 years with a heart for community and spiritual growth.",
      image: "/api/placeholder/300/300",
    },
    {
      name: "Rev. Fr. Alexander Fatimehin",
      role: "Associate Priest",
      bio: "Fr. Alexander Fatimehin leads our parish teams with passion and creates an atmosphere for encountering God's presence.",
      image: "/api/placeholder/300/300",
    },
    {
      name: "Rev. Fr. Augustine A",
      role: "Priest in Residence",
      bio: "Dedicated to mentoring the next generation and helping them grow in their faith journey.",
      image: "/api/placeholder/300/300",
    },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-dark text-church-pearl">
                <div className="absolute inset-0 pattern-geometric" />
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-5xl font-heading font-bold mb-4 text-center">Plan Your Visit</h1>
                    <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
                        We can't wait to welcome you! Here's everything you need to know for your first visit.
                    </p>
                </div>
            </section>

            {/* Mass Schedule */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-heading font-bold text-center mb-12 text-church-charcoal">
                        Mass Schedule
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-2xl font-heading font-semibold mb-4">Sunday Mass</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <p>
                                    <strong>Times:</strong>
                                    <br />
                                    7:00 AM
                                    <br />
                                    8:30 AM
                                    <br />
                                    <strong>10:00 AM (Yoruba)</strong>
                                    <br />
                                    11:30 AM
                                    <br />
                                    6:00 PM
                                </p>
                                <p><strong>Location:</strong> Main Church</p>
                            </div>
                        </Card>
                        <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-2xl font-heading font-semibold mb-4">Weekday Mass</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <p>
                                    <strong>Time:</strong>
                                    <br />
                                    6:30 AM
                                    <br />
                                    12:30 PM
                                    <br />
                                    6:30 PM
                                </p>
                                <p><strong>Location:</strong> Main Church</p>
                                <p><strong>Details:</strong>
                                    A shorter, contemplative Mass with scripture and communion.
                                </p>
                            </div>
                        </Card>
                        <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-2xl font-heading font-semibold mb-4">Saturday Mass</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <p>
                                    <strong>Time:</strong>
                                    <br />
                                    7:30 AM
                                </p>
                                <p><strong>Location:</strong> Main Church</p>
                                <p><strong>Details:</strong>
                                    A quiet Mass to start your weekend with prayer and reflection.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Location & Map */}
            <section className="py-16 bg-church-pearl">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-heading font-bold text-center mb-12 text-church-charcoal">
                            Location & Directions
                        </h2>
                        <p className="text-lg text-church-charcoal/80 text-center mb-8 max-w-2xl mx-auto">
                            Find us in the heart of Surulere, Lagos. We're easy to reach by car or public transport.
                        </p>
                    </motion.div>
                    {/* <div className="grid lg:grid-cols-2 gap-12"> */}
                    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* <h2 className="text-3xl font-serif font-bold mb-6">Find Us</h2> */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Address</h3>
                                        <p className="text-muted-foreground">
                                            123 Church Street, Gbaja<br />
                                            Lagos, Nigeria
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Car className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Parking</h3>
                                        <p className="text-muted-foreground">
                                            Free parking available in our church lot. Additional street parking on Church Street.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Bus className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Public Transport</h3>
                                        <p className="text-muted-foreground">
                                            Bus routes 45 and 67 stop within 2 blocks. BRT station 5 minutes walk.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="default" className="mt-6" asChild>
                                <a
                                    href="https://maps.google.com/?q=St+Anthony+Catholic+Church+Gbaja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Get Directions
                                </a>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="h-[400px] lg:h-full rounded-lg overflow-hidden shadow-lift"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.025!2d3.384!3d6.524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzEnMjYuNCJOIDPCsDIzJzAyLjQiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Church Location Map"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What to Expect */}
            <section className="py-16 bg-church-stone text-lg">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-heading font-bold text-center mb-8 text-church-charcoal">
                            What to Expect
                        </h2>
                        <Accordion type="single" collapsible className="w-full text-xl">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">What should I wear?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground px-6">
                                    We encourage modest and respectful attire. Most people dress in business casual or
                                    semi-formal wear. You're welcome to wear traditional Nigerian attire. The most
                                    important thing is that you come as you are!
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">How long is the service?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground px-6">
                                    Sunday Mass typically lasts 60-90 minutes, including hymns, readings, homily, and
                                    Eucharist. Weekday Mass is shorter, around 30-45 minutes.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <Baby className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">Is there childcare available?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground px-6">
                                    Yes! We have a staffed nursery for infants and toddlers (ages 0-3) during the 9:00 AM
                                    Sunday Mass. Children's Liturgy of the Word is available for ages 4-8. All volunteers
                                    are background-checked and trained.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">Where should I sit?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground px-6">
                                    Sit anywhere you feel comfortable! We don't have assigned seating. If you're new, our
                                    ushers will be happy to help you find a good spot. The center sections fill up first,
                                    so arriving 10-15 minutes early is recommended.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">Can I receive Communion?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground px-6">
                                    Catholics who are properly disposed may receive Communion. If you're not Catholic or
                                    not receiving, you're welcome to remain in your pew during Communion, or come forward
                                    with arms crossed for a blessing.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </section>



            {/* Service Times */}
            <section id="services" className="py-16 bg-gradient-church">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-heading font-serif font-bold text-center mb-12 text-church-charcoal">
                        Have questions before your visit?
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

export default Visit;