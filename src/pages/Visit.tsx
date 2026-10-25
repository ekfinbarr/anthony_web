import { Button } from "@/components/ui/button";
import { BusIcon, CarIcon, ChaliceIcon, ChildIcon, ClockIcon, CommunityIcon, CompassIcon, GarmentIcon, HeartIcon, PewIcon, PinIcon } from "@/components/icons/ParishIcons";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatAddress, mapsEmbedUrl, mapsSearchUrl, site } from "@/config/site";
import { holyHour, massTimesAnswer } from "@/config/parish";
import PageHeader from "@/components/layout/PageHeader";
import MassScheduleList from "@/components/visit/MassScheduleList";

const Visit = () => {
    const values = [
        {
            icon: HeartIcon,
            title: "Love",
            description: "We believe in showing God's love through our actions and relationships.",
        },
        {
            icon: CommunityIcon,
            title: "Community",
            description: "We value authentic relationships and doing life together.",
        },
        {
            icon: CompassIcon,
            title: "Purpose",
            description: "We help people discover and fulfill their God-given purpose.",
        },
    ];


    return (
        <div>
            <PageHeader
                title="Plan Your Visit"
                description="We can't wait to welcome you! Here's everything you need to know for your first visit."
            />

            {/* Mass Schedule */}
            <section id="mass-times" aria-labelledby="mass-times-heading" className="scroll-mt-24 bg-church-pearl/35 py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <h2 id="mass-times-heading" className="mb-4 text-center font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
                        Mass Schedule
                    </h2>
                    {/* <p className="mx-auto mb-10 max-w-2xl text-center text-base text-muted-foreground md:mb-12 md:text-lg">
                        {massTimesAnswer()}
                    </p> */}

                    <MassScheduleList />
                    <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground md:text-base">
                        {holyHour.name}: {holyHour.details}
                    </p>
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
                                    <PinIcon className="h-8 w-8 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Address</h3>
                                        <address className="not-italic text-muted-foreground">
                                            {site.name}<br />
                                            {formatAddress(site.address)}
                                        </address>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <CarIcon className="h-8 w-8 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold mb-1">Parking</h3>
                                        <p className="text-muted-foreground">
                                            Free parking available in our church lot. Additional street parking on Church Street.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <BusIcon className="h-8 w-8 shrink-0" />
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
                                    href={mapsSearchUrl(site)}
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
                                src={mapsEmbedUrl(site)}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Map showing the location of ${site.name}`}
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
                                        <GarmentIcon className="h-7 w-7 shrink-0" />
                                        <span className="font-semibold">What should I wear?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent forceMount className="text-muted-foreground px-6">
                                    We encourage modest and respectful attire. Most people dress in business casual or
                                    semi-formal wear. You're welcome to wear traditional Nigerian attire. The most
                                    important thing is that you come as you are!
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <ClockIcon className="h-7 w-7 shrink-0" />
                                        <span className="font-semibold">How long is the service?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent forceMount className="text-muted-foreground px-6">
                                    Sunday Mass typically lasts 60-90 minutes, including hymns, readings, homily, and
                                    Eucharist. Weekday Mass is shorter, around 30-45 minutes.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <ChildIcon className="h-7 w-7 shrink-0" />
                                        <span className="font-semibold">Is there childcare available?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent forceMount className="text-muted-foreground px-6">
                                    Yes! We have a staffed nursery for infants and toddlers (ages 0-3) during the 9:00 AM
                                    Sunday Mass. Children's Liturgy of the Word is available for ages 4-8. All volunteers
                                    are background-checked and trained.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <PewIcon className="h-7 w-7 shrink-0" />
                                        <span className="font-semibold">Where should I sit?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent forceMount className="text-muted-foreground px-6">
                                    Sit anywhere you feel comfortable! We don't have assigned seating. If you're new, our
                                    ushers will be happy to help you find a good spot. The center sections fill up first,
                                    so arriving 10-15 minutes early is recommended.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                        <ChaliceIcon className="h-7 w-7 shrink-0" />
                                        <span className="font-semibold">Can I receive Communion?</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent forceMount className="text-muted-foreground px-6">
                                    Catholics who are properly disposed may receive Communion. If you're not Catholic or
                                    not receiving, you're welcome to remain in your pew during Communion, or come forward
                                    with arms crossed for a blessing.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </section>



            {/* Visit questions CTA */}
            <section id="services" className="py-16 bg-gradient-church">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-heading font-serif font-bold text-center mb-12 text-church-charcoal">
                        Have questions before your visit?
                    </h2>
                    <div className="text-center mt-8">
                        <Button variant="secondary" size="xl" asChild>
                            <Link to="/contact" className="inline-block">
                                Contact Us
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Visit;