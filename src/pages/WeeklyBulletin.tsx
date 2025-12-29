import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Download, Search, Filter, Calendar, ChevronRight, ChevronLeft, FileDown, Target, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import bannerPhoto from "@/assets/images/church_banner.jpg";

interface Bulletin {
  id: string;
  title: string;
  date: string;
  dateObj: Date;
  description: string;
  thumbnail: string;
  pdfUrl: string;
  downloadCount: number;
}

const ITEMS_PER_PAGE = 12;

// Mock data - in production, this would come from an API
const mockBulletins: Bulletin[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i * 7); // Weekly bulletins
  return {
    id: `bulletin-${i + 1}`,
    title: `Weekly Bulletin - ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    date: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    dateObj: date,
    description: `Stay informed with the latest news and updates from our church community, including upcoming events, recent activities, and important announcements for the week of ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
    thumbnail: bannerPhoto,
    pdfUrl: `/bulletins/bulletin-${i + 1}.pdf`,
    downloadCount: Math.floor(Math.random() * 500) + 50,
  };
});

const WeeklyBulletin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);

  useEffect(() => {
    document.title = "Weekly Bulletin | St. Anthony Catholic Church, Gbaja";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Access our weekly bulletins to stay informed about church news, events, announcements, and community updates at St. Anthony Catholic Church, Gbaja."
      );
    }
  }, []);

  // Fetch bulletins (mock data for now)
  const { data: bulletins = mockBulletins, isLoading } = useQuery<Bulletin[]>({
    queryKey: ["bulletins"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockBulletins;
    },
  });

  // Get latest bulletin
  const latestBulletin = useMemo(() => {
    return bulletins.length > 0 ? bulletins[0] : null;
  }, [bulletins]);

  // Get available years for filter
  const availableYears = useMemo(() => {
    const years = new Set(bulletins.map((b) => b.dateObj.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [bulletins]);

  // Filter and sort bulletins
  const filteredAndSortedBulletins = useMemo(() => {
    let filtered = bulletins.filter((bulletin) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        bulletin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bulletin.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Year filter
      const matchesYear = filterYear === "all" || bulletin.dateObj.getFullYear().toString() === filterYear;

      return matchesSearch && matchesYear;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date-desc") {
        return b.dateObj.getTime() - a.dateObj.getTime();
      } else {
        return a.dateObj.getTime() - b.dateObj.getTime();
      }
    });

    return filtered;
  }, [bulletins, searchTerm, filterYear, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBulletins.length / ITEMS_PER_PAGE);
  const paginatedBulletins = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBulletins.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBulletins, currentPage]);

  const handleDownload = (bulletin: Bulletin) => {
    // In production, this would download the actual PDF file
    const link = document.createElement("a");
    link.href = bulletin.pdfUrl;
    link.download = `${bulletin.title}.pdf`;
    link.click();
  };

  const handleExportPDF = (bulletin: Bulletin) => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(bulletin.title, 20, 20);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Date: ${bulletin.date}`, 20, 30);
      pdf.text(`Download Count: ${bulletin.downloadCount}`, 20, 37);

      pdf.setFontSize(11);
      const lines = pdf.splitTextToSize(bulletin.description, 170);
      pdf.text(lines, 20, 50);

      pdf.save(`${bulletin.title.replace(/\s+/g, "-")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
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
                <BreadcrumbPage>Weekly Bulletin</BreadcrumbPage>
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
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-church-charcoal">
              Weekly Bulletin
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Stay informed with the latest news, events, and announcements from our church community.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => scrollToSection("latest")} variant="outline" size="sm">
                Latest Bulletin
              </Button>
              <Button onClick={() => scrollToSection("past-bulletins")} variant="outline" size="sm">
                Past Bulletins
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Bulletin */}
      {latestBulletin && (
        <section id="latest" className="py-12 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold mb-6 text-center text-church-charcoal">
              Latest Bulletin
            </h2>
            <Card className="hover:shadow-xl transition-shadow max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative">
                  <img
                    src={latestBulletin.thumbnail}
                    alt={latestBulletin.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{latestBulletin.date}</span>
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-3 text-church-charcoal">
                      {latestBulletin.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{latestBulletin.description}</p>
                    <div className="text-sm text-muted-foreground mb-4">
                      <span>{latestBulletin.downloadCount} downloads</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => handleDownload(latestBulletin)} variant="church" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Download Bulletin
                    </Button>
                    <Button onClick={() => handleExportPDF(latestBulletin)} variant="outline" size="lg">
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

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
                    placeholder="Search bulletins..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                    aria-label="Search bulletins"
                  />
                </div>
              </div>

              {/* Filter by Year */}
              <div>
                <Select value={filterYear} onValueChange={(value) => {
                  setFilterYear(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger aria-label="Filter by year">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value as "date-desc" | "date-asc");
                  setCurrentPage(1);
                }}>
                  <SelectTrigger aria-label="Sort bulletins">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {paginatedBulletins.length} of {filteredAndSortedBulletins.length} bulletins
            </div>
          </div>
        </div>
      </section>

      {/* Past Bulletins */}
      <section id="past-bulletins" className="py-12 scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold mb-6 text-center text-church-charcoal">
            Past Bulletins
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading bulletins...</p>
            </div>
          ) : paginatedBulletins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bulletins found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedBulletins.map((bulletin) => (
                  <Card key={bulletin.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={bulletin.thumbnail}
                        alt={bulletin.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{bulletin.date}</span>
                      </div>
                      <h3 className="text-lg font-heading font-semibold mb-2 text-church-charcoal line-clamp-2">
                        {bulletin.title}
                      </h3>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleDownload(bulletin)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          onClick={() => handleExportPDF(bulletin)}
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                        >
                          <FileDown className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
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
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
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

      {/* Cards Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold mb-6 text-center">
            More Ways to Stay Connected
          </h2>
          <p className="text-muted-foreground mb-8 text-center">
            Our weekly bulletin provides important information about upcoming events, service times, and ways to get involved.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 text-center">
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

export default WeeklyBulletin;
