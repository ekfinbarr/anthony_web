import { useState } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Wifi, 
  Projector, 
  Volume2, 
  Car, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ChevronRight,
  Play,
  Check,
  Building2,
  Home,
  Video,
  Image as ImageIcon,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

// Types
type RentalType = "hall" | "conference-room";
type Facility = "wifi" | "projector" | "sound" | "parking" | "security" | "restrooms" | "catering" | "air-conditioning";

interface RentalSpace {
  id: string;
  name: string;
  type: RentalType;
  capacity: number;
  price: number;
  description: string;
  images: string[];
  videos?: string[];
  facilities: Facility[];
  amenities: string[];
  dimensions?: string;
  available?: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// Sample Data
const rentalSpaces: RentalSpace[] = [
  {
    id: "st-francis-hall",
    name: "St. Francis Hall",
    type: "hall",
    capacity: 500,
    price: 150000,
    description: "A spacious and elegant event hall perfect for weddings, conferences, seminars, and large gatherings. Features modern amenities and a beautiful ambiance.",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f29da9b5e0?w=1200",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
      "https://images.unsplash.com/photo-1519167758481-83f29da9b5e0?w=1200",
    ],
    facilities: ["wifi", "projector", "sound", "parking", "security", "restrooms", "catering", "air-conditioning"],
    amenities: ["Stage", "Dance Floor", "VIP Area", "Bridal Suite", "Outdoor Space"],
    dimensions: "30m x 20m",
    available: true,
  },
  {
    id: "conference-room-a",
    name: "Conference Room A",
    type: "conference-room",
    capacity: 30,
    price: 25000,
    description: "Ideal for meetings, workshops, and small conferences. Equipped with modern presentation equipment.",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    ],
    facilities: ["wifi", "projector", "sound", "parking", "restrooms", "air-conditioning"],
    amenities: ["Whiteboard", "Conference Table", "Video Conferencing"],
    dimensions: "10m x 8m",
    available: true,
  },
  {
    id: "conference-room-b",
    name: "Conference Room B",
    type: "conference-room",
    capacity: 50,
    price: 35000,
    description: "Medium-sized conference room perfect for training sessions and corporate meetings.",
    images: [
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200",
    ],
    facilities: ["wifi", "projector", "sound", "parking", "restrooms", "air-conditioning"],
    amenities: ["Interactive Whiteboard", "Conference Table", "Video Conferencing", "Coffee Station"],
    dimensions: "12m x 10m",
    available: true,
  },
  {
    id: "conference-room-c",
    name: "Conference Room C",
    type: "conference-room",
    capacity: 20,
    price: 20000,
    description: "Intimate meeting space for small groups and brainstorming sessions.",
    images: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
    ],
    facilities: ["wifi", "projector", "parking", "restrooms", "air-conditioning"],
    amenities: ["Whiteboard", "Round Table", "Video Conferencing"],
    dimensions: "8m x 6m",
    available: true,
  },
];

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Grace Adeyemi",
    role: "Event Planner",
    rating: 5,
    comment: "St. Francis Hall is absolutely beautiful! The staff was professional and accommodating. Our wedding was perfect!",
    date: "December 2023",
  },
  {
    id: "2",
    name: "John Okafor",
    role: "Corporate Executive",
    rating: 5,
    comment: "Conference Room B was perfect for our training session. The facilities are top-notch and the pricing is reasonable.",
    date: "November 2023",
  },
  {
    id: "3",
    name: "Maryam Ibrahim",
    role: "Non-Profit Organizer",
    rating: 5,
    comment: "We hosted our annual conference here and everything went smoothly. The hall was spacious and well-equipped.",
    date: "October 2023",
  },
  {
    id: "4",
    name: "David Okonkwo",
    role: "Entrepreneur",
    rating: 5,
    comment: "Great value for money! The conference rooms are modern and the staff is very helpful.",
    date: "September 2023",
  },
];

const faqs: FAQ[] = [
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2-4 weeks in advance to ensure availability. However, last-minute bookings may be possible depending on availability.",
  },
  {
    question: "What is included in the rental fee?",
    answer: "The rental fee includes the use of the space, basic furniture setup, and access to included facilities. Additional services like catering, decoration, and special equipment may incur extra charges.",
  },
  {
    question: "Can I bring my own caterer?",
    answer: "Yes, you are welcome to bring your own caterer. However, we also have preferred catering partners we can recommend.",
  },
  {
    question: "Is there parking available?",
    answer: "Yes, we have ample parking space available for all events. Parking is included in the rental fee.",
  },
  {
    question: "What are the cancellation policies?",
    answer: "Cancellations made 14 days or more before the event will receive a full refund. Cancellations within 7-14 days will receive a 50% refund. Cancellations less than 7 days before the event are non-refundable.",
  },
  {
    question: "Do you provide security?",
    answer: "Yes, security services are included for all events. Additional security personnel can be arranged for larger events upon request.",
  },
  {
    question: "Are decorations allowed?",
    answer: "Yes, decorations are allowed. However, we ask that no permanent alterations be made and that all decorations be removed after the event.",
  },
  {
    question: "What is the maximum capacity?",
    answer: "St. Francis Hall can accommodate up to 500 guests. Conference rooms range from 20-50 people depending on the room.",
  },
];

const facilityLabels: Record<Facility, { label: string; icon: React.ElementType }> = {
  wifi: { label: "WiFi", icon: Wifi },
  projector: { label: "Projector", icon: Projector },
  sound: { label: "Sound System", icon: Volume2 },
  parking: { label: "Parking", icon: Car },
  security: { label: "Security", icon: Shield },
  restrooms: { label: "Restrooms", icon: Users },
  catering: { label: "Catering Available", icon: Building2 },
  "air-conditioning": { label: "Air Conditioning", icon: Building2 },
};

// Booking Form Schema
const bookingSchema = z.object({
  spaceId: z.string().min(1, "Please select a space"),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  expectedGuests: z.number().min(1, "Number of guests is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  organization: z.string().optional(),
  additionalRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const Rentals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RentalType | "all">("all");
  const [selectedSpace, setSelectedSpace] = useState<RentalSpace | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      spaceId: "",
      eventType: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      expectedGuests: 1,
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      additionalRequests: "",
    },
  });

  // Filter spaces
  const filteredSpaces = rentalSpaces.filter((space) => {
    const matchesSearch = 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || space.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const halls = filteredSpaces.filter((s) => s.type === "hall");
  const conferenceRooms = filteredSpaces.filter((s) => s.type === "conference-room");

  const handleBooking = (space: RentalSpace) => {
    setSelectedSpace(space);
    form.setValue("spaceId", space.id);
    setBookingDialogOpen(true);
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Here you would typically send the data to your backend
      console.log("Booking data:", data);
      
      toast({
        title: "Booking Request Submitted",
        description: "We'll contact you shortly to confirm your booking. Thank you!",
      });
      
      form.reset();
      setBookingDialogOpen(false);
      setSelectedSpace(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Hall & Rentals</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f29da9b5e0?w=1200"
            alt="Event Hall"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary/60" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground px-4">
          <Badge className="mb-4 bg-primary text-primary-foreground">Event Spaces</Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-in">
            Hall & <span className="text-primary">Rentals</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Perfect venues for your events, conferences, and special occasions
          </p>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Available Daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span className="text-sm font-medium">+234 802 345 6789</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">rentals@stanthonygbaja.org</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Church Premises, Gbaja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search halls and rooms..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search rental spaces"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Spaces
              </Button>
              <Button
                variant={selectedCategory === "hall" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("hall")}
              >
                Event Halls
              </Button>
              <Button
                variant={selectedCategory === "conference-room" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("conference-room")}
              >
                Conference Rooms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hall & Rentals Section */}
      {halls.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Event <span className="text-primary">Halls</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Spacious and elegant venues perfect for weddings, conferences, and large gatherings
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {halls.map((hall, index) => (
                <Card key={hall.id} className="overflow-hidden group hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="relative aspect-video overflow-hidden">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {hall.images.map((img, imgIndex) => (
                          <CarouselItem key={imgIndex}>
                            <img
                              src={img}
                              alt={`${hall.name} - Image ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      {hall.capacity} Capacity
                    </Badge>
                    {hall.available ? (
                      <Badge variant="secondary" className="absolute top-4 right-4">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="absolute top-4 right-4">
                        Booked
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl">{hall.name}</CardTitle>
                    <CardDescription className="text-base">{hall.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-primary mb-2">{formatPrice(hall.price)}</p>
                        <p className="text-sm text-muted-foreground">per event</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Capacity & Details
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Capacity: Up to {hall.capacity} guests</li>
                          {hall.dimensions && <li>• Dimensions: {hall.dimensions}</li>}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Facilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {hall.facilities.map((facility) => {
                            const { label, icon: Icon } = facilityLabels[facility];
                            return (
                              <Badge key={facility} variant="outline" className="gap-1">
                                <Icon className="h-3 w-3" />
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {hall.amenities.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Amenities</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {hall.amenities.map((amenity) => (
                              <li key={amenity} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                {amenity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => handleBooking(hall)}
                      disabled={!hall.available}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conference Rooms Section */}
      {conferenceRooms.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Conference <span className="text-primary">Rooms</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Modern meeting spaces equipped with everything you need for successful conferences and workshops
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conferenceRooms.map((room, index) => (
                <Card key={room.id} className="overflow-hidden group hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      {room.capacity} Capacity
                    </Badge>
                    {room.available ? (
                      <Badge variant="secondary" className="absolute top-4 right-4">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="absolute top-4 right-4">
                        Booked
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>{room.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xl font-bold text-primary mb-1">{formatPrice(room.price)}</p>
                        <p className="text-xs text-muted-foreground">per event</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Facilities</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {room.facilities.slice(0, 4).map((facility) => {
                            const { label, icon: Icon } = facilityLabels[facility];
                            return (
                              <Badge key={facility} variant="outline" className="text-xs gap-1">
                                <Icon className="h-3 w-3" />
                                {label}
                              </Badge>
                            );
                          })}
                          {room.facilities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.facilities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleBooking(room)}
                      disabled={!room.available}
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredSpaces.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No spaces found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
          </div>
        </section>
      )}

      {/* Amenities & Facilities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Amenities & <span className="text-primary">Facilities</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for a successful event
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(facilityLabels).map(([key, { label, icon: Icon }]) => (
              <Card key={key} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">{label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Client <span className="text-primary">Testimonials</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what our clients have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{testimonial.date}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about booking our spaces
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b">
                  <AccordionTrigger className="text-left hover:no-underline hover:text-primary px-6 py-4">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact & Map Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">
                Contact <span className="text-primary">Us</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Have questions or ready to book? Get in touch with us through any of the following channels.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+2348023456789" className="text-muted-foreground hover:text-primary transition-colors">
                      +234 802 345 6789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:rentals@stanthonygbaja.org" className="text-muted-foreground hover:text-primary transition-colors">
                      rentals@stanthonygbaja.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      St. Anthony Catholic Church<br />
                      123 Gbaja Street, Surulere<br />
                      Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href="https://wa.me/2348023456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">
                Map & <span className="text-primary">Directions</span>
              </h2>
              <div className="bg-card rounded-xl overflow-hidden shadow-lg">
                <div className="aspect-video">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.9!2d3.35!3d6.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzAnMDAuMCJOIDPCsDIxJzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="St. Anthony Catholic Church Location"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <Button className="w-full" variant="outline" asChild>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=St.+Anthony+Catholic+Church+Gbaja+Lagos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Book Your Event?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Contact us today to reserve your perfect venue. Our team is ready to help make your event memorable.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="tel:+2348023456789" className="gap-2">
                <Phone className="h-5 w-5" />
                Call Now
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href="mailto:rentals@stanthonygbaja.org" className="gap-2">
                <Mail className="h-5 w-5" />
                Send Email
              </a>
            </Button>
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Online
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Book a Space</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to request a booking. We'll contact you shortly to confirm.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="spaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Space</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a space" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rentalSpaces.map((space) => (
                                <SelectItem key={space.id} value={space.id} disabled={!space.available}>
                                  {space.name} - {formatPrice(space.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="seminar">Seminar</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="celebration">Celebration</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expectedGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Guests</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+234 802 345 6789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Company or Organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Requests (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requirements or additional information..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Let us know if you have any special requirements or requests.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" className="flex-1" size="lg">
                        Submit Booking Request
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBookingDialogOpen(false)}
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rentals;