import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import jsPDF from "jspdf";
import legalDocumentService from "@/services/legalDocument.service";

const PRIVACY_SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use-information", title: "How We Use Your Information" },
  { id: "information-sharing", title: "Information Sharing" },
  { id: "data-security", title: "Data Security" },
  { id: "your-rights", title: "Your Rights" },
  { id: "cookies", title: "Cookies and Tracking" },
  { id: "children-privacy", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
] as const;

const PrivacyPolicy = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("");
  const [remoteTitle, setRemoteTitle] = useState("Privacy Policy");
  const [remoteContent, setRemoteContent] = useState<string | null>(null);
  const [remoteLastUpdated, setRemoteLastUpdated] = useState<string>("January 15, 2024");

  const sections = PRIVACY_SECTIONS;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

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

  const handlePrint = () => {
    if (!contentRef.current) return;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Get text content from the ref
      const content = contentRef.current;
      const text = content?.textContent || content?.innerText || "";

      // Split text into pages
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 7;
      let y = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Privacy Policy", pageWidth / 2, y, { align: "center" });
      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Last updated: ${lastUpdated}`, pageWidth / 2, y, { align: "center" });
      y += 10;

      // Add content
      pdf.setFontSize(11);
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      if (Array.isArray(lines)) {
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += lineHeight;
        });
      }

      pdf.save("Privacy-Policy-St-Anthony-Gbaja.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to browser print
      window.print();
    }
  };

  const lastUpdated = remoteLastUpdated;

  // Load latest published legal doc from backend (falls back to static content if unavailable)
  useEffect(() => {
    const load = async () => {
      try {
        const doc = await legalDocumentService.getLatest("privacy_policy");
        setRemoteTitle(doc.title || "Privacy Policy");
        setRemoteContent(doc.content || null);

        const updated = doc.effective_at || doc.published_at;
        if (updated) {
          // Keep as ISO string for PDF generation; display is fine as-is for now
          setRemoteLastUpdated(updated);
        }
      } catch {
        // Keep default static content
      }
    };

    load();
  }, []);

  useEffect(() => {
    document.title = "Privacy Policy | St. Anthony Catholic Church, Gbaja";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Read our privacy policy to understand how St. Anthony Catholic Church, Gbaja collects, uses, and protects your personal information."
      );
    }
  }, []);

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
                  <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
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
                {remoteTitle}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Last updated: <span className="font-semibold">{lastUpdated}</span>
                </p>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Table of Contents Sidebar */}
                <aside className="lg:col-span-1">
                  <div className="sticky top-24">
                    <Card className="p-6 bg-church-pearl">
                      <h2 className="text-lg font-heading font-semibold mb-4 text-church-charcoal">
                        Table of Contents
                      </h2>
                      <nav className="space-y-2">
                        {sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              activeSection === section.id
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {section.title}
                          </button>
                        ))}
                      </nav>
                    </Card>
                  </div>
                </aside>

                {/* Content */}
                <div className="lg:col-span-3" ref={contentRef}>
                  <div className="prose prose-lg max-w-none">
                    {/* Remote legal document (if available) */}
                    {remoteContent && (
                      <section className="mb-12">
                        <h2 className="text-2xl font-heading font-bold text-church-charcoal mb-3">
                          Official Policy (Latest Published)
                        </h2>
                        <div className="whitespace-pre-wrap text-muted-foreground">
                          {remoteContent}
                        </div>
                      </section>
                    )}

                    {/* Introduction (static fallback / structured content) */}
                    <section id="introduction" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        1. Introduction
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        St. Anthony Catholic Church, Gbaja ("we," "our," or "us") is committed to protecting your
                        privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you visit our website or use our services.
                      </p>
                      <p className="text-muted-foreground">
                        By using our website, you consent to the data practices described in this policy. If you do not
                        agree with the practices described in this policy, please do not use our website.
                      </p>
                    </section>

                    {/* Information We Collect */}
                    <section id="information-we-collect" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        2. Information We Collect
                      </h2>
                      <h3 className="text-xl font-heading font-semibold mb-3 mt-6">2.1 Personal Information</h3>
                      <p className="text-muted-foreground mb-4">
                        We may collect personal information that you voluntarily provide to us when you:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>Register for an account on our website</li>
                        <li>Book Mass intentions or sacraments</li>
                        <li>Make donations or contributions</li>
                        <li>Subscribe to our newsletter or communications</li>
                        <li>Contact us through forms or email</li>
                        <li>Participate in events or ministries</li>
                      </ul>
                      <p className="text-muted-foreground mb-4">
                        This information may include: name, email address, phone number, mailing address, date of
                        birth, payment information, and other details you choose to provide.
                      </p>

                      <h3 className="text-xl font-heading font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
                      <p className="text-muted-foreground mb-4">
                        When you visit our website, we automatically collect certain information about your device,
                        including:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>IP address</li>
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>Pages visited and time spent on pages</li>
                        <li>Referring website addresses</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </section>

                    {/* How We Use Information */}
                    <section id="how-we-use-information" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        3. How We Use Your Information
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        We use the information we collect for various purposes, including:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>To provide and maintain our services</li>
                        <li>To process Mass bookings, sacraments, and donations</li>
                        <li>To send you newsletters, updates, and communications about church activities</li>
                        <li>To respond to your inquiries and provide customer support</li>
                        <li>To improve our website and services</li>
                        <li>To detect, prevent, and address technical issues</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect the rights, property, or safety of the church and its members</li>
                      </ul>
                    </section>

                    {/* Information Sharing */}
                    <section id="information-sharing" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        4. Information Sharing
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        We do not sell, trade, or rent your personal information to third parties. We may share your
                        information only in the following circumstances:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>
                          <strong>Service Providers:</strong> We may share information with trusted service providers
                          who assist us in operating our website and conducting church activities, subject to
                          confidentiality agreements.
                        </li>
                        <li>
                          <strong>Legal Requirements:</strong> We may disclose information if required by law or in
                          response to valid legal requests.
                        </li>
                        <li>
                          <strong>Church Directory:</strong> With your consent, your name and contact information may be
                          included in our internal church directory, accessible only to registered members.
                        </li>
                        <li>
                          <strong>Protection of Rights:</strong> We may share information to protect our rights,
                          privacy, safety, or property, or that of our members.
                        </li>
                      </ul>
                    </section>

                    {/* Data Security */}
                    <section id="data-security" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        5. Data Security
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        We implement appropriate technical and organizational security measures to protect your personal
                        information against unauthorized access, alteration, disclosure, or destruction. These measures
                        include:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>Encryption of sensitive data in transit and at rest</li>
                        <li>Secure servers and databases</li>
                        <li>Regular security assessments and updates</li>
                        <li>Access controls and authentication procedures</li>
                        <li>Staff training on data protection</li>
                      </ul>
                      <p className="text-muted-foreground">
                        However, no method of transmission over the Internet or electronic storage is 100% secure. While
                        we strive to use commercially acceptable means to protect your information, we cannot guarantee
                        absolute security.
                      </p>
                    </section>

                    {/* Your Rights */}
                    <section id="your-rights" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        6. Your Rights
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        You have certain rights regarding your personal information, including:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>
                          <strong>Access:</strong> You can request access to the personal information we hold about you.
                        </li>
                        <li>
                          <strong>Correction:</strong> You can request correction of inaccurate or incomplete
                          information.
                        </li>
                        <li>
                          <strong>Deletion:</strong> You can request deletion of your personal information, subject to
                          legal and operational requirements.
                        </li>
                        <li>
                          <strong>Opt-out:</strong> You can opt-out of receiving marketing communications from us.
                        </li>
                        <li>
                          <strong>Data Portability:</strong> You can request a copy of your data in a structured,
                          machine-readable format.
                        </li>
                      </ul>
                      <p className="text-muted-foreground">
                        To exercise these rights, please contact us using the information provided in the "Contact Us"
                        section below.
                      </p>
                    </section>

                    {/* Cookies */}
                    <section id="cookies" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        7. Cookies and Tracking
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        We use cookies and similar tracking technologies to track activity on our website and store
                        certain information. Cookies are small data files stored on your device.
                      </p>
                      <p className="text-muted-foreground mb-4">
                        We use cookies for:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>Essential website functionality</li>
                        <li>Analytics and performance monitoring</li>
                        <li>Personalization of your experience</li>
                        <li>Remembering your preferences</li>
                      </ul>
                      <p className="text-muted-foreground mb-4">
                        You can control cookies through your browser settings. However, disabling cookies may affect
                        the functionality of our website.
                      </p>
                      <p className="text-muted-foreground">
                        For more detailed information about our use of cookies, please see our{" "}
                        <Link to="/cookies" className="text-primary hover:underline">
                          Cookie Policy
                        </Link>
                        .
                      </p>
                    </section>

                    {/* Children's Privacy */}
                    <section id="children-privacy" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        8. Children's Privacy
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Our website is not intended for children under the age of 13. We do not knowingly collect
                        personal information from children under 13. If you are a parent or guardian and believe your
                        child has provided us with personal information, please contact us immediately.
                      </p>
                      <p className="text-muted-foreground">
                        If we discover that we have collected information from a child under 13, we will delete that
                        information promptly.
                      </p>
                    </section>

                    {/* Changes */}
                    <section id="changes" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        9. Changes to This Policy
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by:
                      </p>
                      <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                        <li>Posting the new Privacy Policy on this page</li>
                        <li>Updating the "Last updated" date</li>
                        <li>Sending you an email notification (for significant changes)</li>
                      </ul>
                      <p className="text-muted-foreground">
                        You are advised to review this Privacy Policy periodically for any changes. Changes to this
                        policy are effective when posted on this page.
                      </p>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="mb-12 scroll-mt-24">
                      <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                        10. Contact Us
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                      </p>
                      <Card className="p-6 bg-church-pearl">
                        <div className="space-y-2 text-muted-foreground">
                          <p>
                            <strong className="text-church-charcoal">St. Anthony Catholic Church, Gbaja</strong>
                          </p>
                          <p>123 Gbaja Street, Surulere, Lagos</p>
                          <p>Email: privacy@stanthonygbaja.org</p>
                          <p>Phone: (234) 234 567 8910</p>
                        </div>
                      </Card>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
};

export default PrivacyPolicy;
