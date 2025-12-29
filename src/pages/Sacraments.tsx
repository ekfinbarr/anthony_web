import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Cross,
  Calendar,
  Clock,
  Users,
  Mail,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Sacrament {
  id: string;
  name: string;
  description: string;
  category: string;
  schedule?: {
    date: string;
    time: string;
    location: string;
  };
  requirements: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  registrationRequired: boolean;
  registrationDeadline?: string;
}

const ITEMS_PER_PAGE = 9;

// Mock data
const mockSacraments: Sacrament[] = [
  {
    id: "baptism",
    name: "Baptism",
    description:
      "Baptism is the first sacrament of initiation, welcoming individuals into the Christian community. Through baptism, we are cleansed of original sin and become members of the Church.",
    category: "Initiation",
    schedule: {
      date: "First Saturday of each month",
      time: "10:00 AM",
      location: "Main Sanctuary",
    },
    requirements: [
      "Birth certificate",
      "Godparent certificates",
      "Baptism preparation class attendance",
      "Parent meeting with priest",
    ],
    contact: {
      name: "Rev. Fr. Alexander Fatimehin",
      email: "baptism@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: true,
    registrationDeadline: "2 weeks before scheduled date",
  },
  {
    id: "confirmation",
    name: "Confirmation",
    description:
      "Confirmation completes the grace of Baptism by a special outpouring of the gifts of the Holy Spirit, which seal or confirm the baptized in union with Christ.",
    category: "Initiation",
    schedule: {
      date: "Annually during Easter season",
      time: "TBA",
      location: "Main Sanctuary",
    },
    requirements: [
      "Baptism certificate",
      "Confirmation sponsor",
      "Completion of religious education classes",
      "Age requirement: 16 years or older",
    ],
    contact: {
      name: "Rev. Fr. Augustine A",
      email: "confirmation@stanthonygbaja.org",
      phone: "(234) 234 567 8911",
    },
    registrationRequired: true,
    registrationDeadline: "3 months before scheduled date",
  },
  {
    id: "eucharist",
    name: "Holy Eucharist (First Communion)",
    description:
      "The Eucharist is the source and summit of the Christian life. Through this sacrament, we receive the Body and Blood of Christ.",
    category: "Initiation",
    schedule: {
      date: "Annually during Easter season",
      time: "10:00 AM",
      location: "Main Sanctuary",
    },
    requirements: [
      "Baptism certificate",
      "Completion of First Communion preparation classes",
      "Regular attendance at Mass",
      "Age requirement: 7-8 years old",
    ],
    contact: {
      name: "Rev. Fr. Alexander Fatimehin",
      email: "eucharist@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: true,
    registrationDeadline: "2 months before scheduled date",
  },
  {
    id: "reconciliation",
    name: "Reconciliation (Confession)",
    description:
      "The sacrament of Reconciliation offers us God's forgiveness and the opportunity to reconcile with God and the Church community.",
    category: "Healing",
    schedule: {
      date: "Every Saturday",
      time: "5:00 PM - 6:00 PM",
      location: "Confessionals",
    },
    requirements: ["Examination of conscience", "Sincere contrition", "Confession of sins"],
    contact: {
      name: "Parish Office",
      email: "confession@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: false,
  },
  {
    id: "anointing",
    name: "Anointing of the Sick",
    description:
      "This sacrament provides spiritual healing and strength to those who are seriously ill or facing surgery.",
    category: "Healing",
    schedule: {
      date: "As needed",
      time: "By appointment",
      location: "Home or Hospital",
    },
    requirements: ["Serious illness or advanced age", "Request from individual or family"],
    contact: {
      name: "Parish Office",
      email: "anointing@stanthonygbaja.org",
      phone: "(234) 234 567 8910",
    },
    registrationRequired: true,
  },
  {
    id: "matrimony",
    name: "Matrimony (Marriage)",
    description:
      "Marriage is a sacred covenant between a man and a woman, uniting them in Christ and calling them to live out their vocation together.",
    category: "Service",
    schedule: {
      date: "By appointment",
      time: "By arrangement",
      location: "Main Sanctuary",
    },
    requirements: [
      "Marriage preparation classes",
      "Baptism certificates",
      "Freedom to marry certificate",
      "Pre-nuptial investigation",
      "6 months advance notice",
    ],
    contact: {
      name: "Rev. Fr. Bernard Okodua",
      email: "marriage@stanthonygbaja.org",
      phone: "(234) 234 567 8912",
    },
    registrationRequired: true,
    registrationDeadline: "6 months before desired date",
  },
  {
    id: "holy-orders",
    name: "Holy Orders",
    description:
      "Holy Orders is the sacrament through which the mission entrusted by Christ to his apostles continues to be exercised in the Church.",
    category: "Service",
    schedule: {
      date: "By arrangement with Diocese",
      time: "TBA",
      location: "Cathedral",
    },
    requirements: [
      "Call to priesthood or diaconate",
      "Completion of seminary formation",
      "Approval from Bishop",
      "Age requirement: 25 years or older",
    ],
    contact: {
      name: "Diocesan Vocation Office",
      email: "vocations@diocese.org",
      phone: "(234) 234 567 8900",
    },
    registrationRequired: true,
  },
];

const registrationSchema = z.object({
  sacramentId: z.string().min(1, "Please select a sacrament"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  preferredDate: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Sacraments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSacrament, setSelectedSacrament] = useState<Sacrament | null>(null);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);

  useEffect(() => {
    document.title = "Sacraments | St. Anthony Catholic Church, Gbaja";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Learn about the seven sacraments of the Catholic Church, their requirements, schedules, and registration information at St. Anthony Catholic Church, Gbaja."
      );
    }
  }, []);

  // Fetch sacraments
  const { data: sacraments = mockSacraments, isLoading } = useQuery<Sacrament[]>({
    queryKey: ["sacraments"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockSacraments;
    },
  });

  // Registration form
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      sacramentId: "",
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      preferredDate: "",
      additionalInfo: "",
    },
  });

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, id: `reg-${Date.now()}` };
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your sacrament registration has been submitted. We will contact you soon.",
      });
      setIsRegistrationDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(sacraments.map((s) => s.category));
    return Array.from(cats);
  }, [sacraments]);

  // Filter and sort
  const filteredAndSortedSacraments = useMemo(() => {
    let filtered = sacraments.filter((sacrament) => {
      const matchesSearch =
        searchTerm === "" ||
        sacrament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sacrament.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sacrament.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === "all" || sacrament.category === filterCategory;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return a.category.localeCompare(b.category);
      }
    });

    return filtered;
  }, [sacraments, searchTerm, filterCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSacraments.length / ITEMS_PER_PAGE);
  const paginatedSacraments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSacraments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedSacraments, currentPage]);

  const handleRegisterClick = (sacrament: Sacrament) => {
    setSelectedSacrament(sacrament);
    form.setValue("sacramentId", sacrament.id);
    setIsRegistrationDialogOpen(true);
  };

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-church-pearl border-b">
        <div className="container mx-auto px-4 py-4">
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
                <BreadcrumbPage>Sacraments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Cross className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-church-charcoal">
              The Seven Sacraments
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Discover the sacraments of the Catholic Church and learn how to prepare for and receive them.
            </p>
          </div>
        </div>
      </section>

      {/* Search, Filter, and Sort */}
      <section className="py-8 bg-church-pearl">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search sacraments..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                    aria-label="Search sacraments"
                  />
                </div>
              </div>

              {/* Filter by Category */}
              <div>
                <Select
                  value={filterCategory}
                  onValueChange={(value) => {
                    setFilterCategory(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Filter by category">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value as "name" | "category");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Sort sacraments">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="category">Sort by Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {paginatedSacraments.length} of {filteredAndSortedSacraments.length} sacraments
            </div>
          </div>
        </div>
      </section>

      {/* Sacraments List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading sacraments...</p>
            </div>
          ) : paginatedSacraments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sacraments found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedSacraments.map((sacrament) => (
                  <Card key={sacrament.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl font-heading text-church-charcoal">
                          {sacrament.name}
                        </CardTitle>
                        <Badge variant="outline">{sacrament.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{sacrament.description}</p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Schedule */}
                      {sacrament.schedule && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{sacrament.schedule.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{sacrament.schedule.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{sacrament.schedule.location}</span>
                          </div>
                        </div>
                      )}

                      {/* Requirements Preview */}
                      {sacrament.requirements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-1">Requirements:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {sacrament.requirements.slice(0, 2).map((req, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="mt-1">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                            {sacrament.requirements.length > 2 && (
                              <li className="text-primary">+{sacrament.requirements.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Contact */}
                      <div className="mb-4 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{sacrament.contact.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${sacrament.contact.email}`}
                            className="text-primary hover:underline text-xs"
                          >
                            {sacrament.contact.email}
                          </a>
                        </div>
                      </div>

                      {/* Registration Button */}
                      {sacrament.registrationRequired && (
                        <Button
                          onClick={() => handleRegisterClick(sacrament)}
                          variant="church"
                          className="w-full mt-auto"
                        >
                          Register Now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        const showEllipsisBefore = index > 0 && array[index - 1] < page - 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && <span className="px-2 text-muted-foreground">...</span>}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              aria-label={`Go to page ${page}`}
                              aria-current={currentPage === page ? "page" : undefined}
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {selectedSacrament?.name}</DialogTitle>
            <DialogDescription>
              Please fill out the form below to register for {selectedSacrament?.name}. We will contact you
              shortly.
            </DialogDescription>
          </DialogHeader>

          {selectedSacrament && (
            <div className="mb-6 p-4 bg-church-pearl rounded-lg">
              <h4 className="font-semibold mb-2">Sacrament Information</h4>
              {selectedSacrament.schedule && (
                <div className="space-y-1 text-sm text-muted-foreground mb-2">
                  <p>
                    <strong>Schedule:</strong> {selectedSacrament.schedule.date} at {selectedSacrament.schedule.time}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedSacrament.schedule.location}
                  </p>
                </div>
              )}
              {selectedSacrament.registrationDeadline && (
                <p className="text-sm text-muted-foreground">
                  <strong>Registration Deadline:</strong> {selectedSacrament.registrationDeadline}
                </p>
              )}
              <div className="mt-3">
                <p className="text-sm font-semibold mb-1">Requirements:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedSacrament.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-semibold mb-1">Contact Information:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Contact:</strong> {selectedSacrament.contact.name}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${selectedSacrament.contact.email}`} className="text-primary hover:underline">
                      {selectedSacrament.contact.email}
                    </a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={`tel:${selectedSacrament.contact.phone}`} className="text-primary hover:underline">
                      {selectedSacrament.contact.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(234) 234 567 8910" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date (if applicable)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information you'd like to share..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegistrationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="church" disabled={registrationMutation.isPending}>
                  {registrationMutation.isPending ? "Submitting..." : "Submit Registration"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sacraments;
