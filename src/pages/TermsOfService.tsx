import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Scale, CheckCircle, ChevronRight } from "lucide-react";
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

const TermsOfService = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("");
  const [accepted, setAccepted] = useState(false);

  const sections = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "use-of-service", title: "Use of Service" },
    { id: "user-accounts", title: "User Accounts" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "user-content", title: "User Content" },
    { id: "prohibited-activities", title: "Prohibited Activities" },
    { id: "termination", title: "Termination" },
    { id: "disclaimers", title: "Disclaimers" },
    { id: "limitation-liability", title: "Limitation of Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "governing-law", title: "Governing Law" },
    { id: "changes", title: "Changes to Terms" },
    { id: "contact", title: "Contact Us" },
  ];

  useEffect(() => {
    document.title = "Terms of Service | St. Anthony Catholic Church, Gbaja";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Read our terms of service to understand the rules and guidelines for using the St. Anthony Catholic Church, Gbaja website and services."
      );
    }
  }, []);

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
  }, []);

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

  const handleAcceptTerms = () => {
    setAccepted(true);
    // Store acceptance in localStorage
    localStorage.setItem("termsAccepted", "true");
    localStorage.setItem("termsAcceptedDate", new Date().toISOString());
    // You can add additional logic here, such as updating user preferences
  };

  const lastUpdated = "January 15, 2024";

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
                <BreadcrumbPage>Terms of Service</BreadcrumbPage>
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
              <Scale className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-church-charcoal">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Please read these terms carefully before using our website and services.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: <span className="font-semibold">{lastUpdated}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sticky Table of Contents Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card className="p-6 bg-church-pearl">
                    <h2 className="text-lg font-heading font-semibold mb-4 text-church-charcoal">
                      Table of Contents
                    </h2>
                    <nav className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                  {/* Acceptance of Terms */}
                  <section id="acceptance" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      1. Acceptance of Terms
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      By accessing and using the website of St. Anthony Catholic Church, Gbaja ("the Church," "we,"
                      "our," or "us"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do
                      not agree to these Terms, please do not use our website or services.
                    </p>
                    <p className="text-muted-foreground">
                      These Terms apply to all visitors, users, and others who access or use our website and services.
                    </p>
                  </section>

                  {/* Use of Service */}
                  <section id="use-of-service" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      2. Use of Service
                    </h2>
                    <h3 className="text-xl font-heading font-semibold mb-3 mt-6">2.1 Eligibility</h3>
                    <p className="text-muted-foreground mb-4">
                      You must be at least 13 years old to use our website. By using our services, you represent and
                      warrant that you are at least 13 years old and have the legal capacity to enter into these Terms.
                    </p>

                    <h3 className="text-xl font-heading font-semibold mb-3 mt-6">2.2 Permitted Use</h3>
                    <p className="text-muted-foreground mb-4">
                      You may use our website and services for lawful purposes only, including:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                      <li>Accessing information about church activities and events</li>
                      <li>Registering for Mass bookings and sacraments</li>
                      <li>Making donations and contributions</li>
                      <li>Participating in church ministries and groups</li>
                      <li>Communicating with church staff and members</li>
                    </ul>
                  </section>

                  {/* User Accounts */}
                  <section id="user-accounts" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      3. User Accounts
                    </h2>
                    <h3 className="text-xl font-heading font-semibold mb-3 mt-6">3.1 Account Registration</h3>
                    <p className="text-muted-foreground mb-4">
                      To access certain features of our website, you may be required to create an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and update your account information</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized access</li>
                    </ul>

                    <h3 className="text-xl font-heading font-semibold mb-3 mt-6">3.2 Account Security</h3>
                    <p className="text-muted-foreground">
                      You are responsible for maintaining the confidentiality of your account password and for all
                      activities that occur under your account. We are not liable for any loss or damage arising from
                      your failure to protect your account information.
                    </p>
                  </section>

                  {/* Intellectual Property */}
                  <section id="intellectual-property" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      4. Intellectual Property
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      All content on our website, including text, graphics, logos, images, audio, video, and software, is
                      the property of St. Anthony Catholic Church, Gbaja or its content suppliers and is protected by
                      copyright, trademark, and other intellectual property laws.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                      perform, republish, download, store, or transmit any of the material on our website without our
                      prior written consent, except:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                      <li>Your computer may temporarily store copies of materials in RAM</li>
                      <li>You may store files that are automatically cached by your browser</li>
                      <li>You may print or download one copy of a reasonable number of pages for personal,
                        non-commercial use</li>
                    </ul>
                  </section>

                  {/* User Content */}
                  <section id="user-content" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      5. User Content
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Our website may allow you to post, submit, publish, display, or transmit content ("User Content").
                      By posting User Content, you grant us a non-exclusive, worldwide, royalty-free, perpetual,
                      irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate,
                      create derivative works from, distribute, and display such content.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You represent and warrant that your User Content:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                      <li>Does not violate any third-party rights</li>
                      <li>Is not defamatory, obscene, or offensive</li>
                      <li>Does not contain viruses or harmful code</li>
                      <li>Complies with all applicable laws and regulations</li>
                    </ul>
                  </section>

                  {/* Prohibited Activities */}
                  <section id="prohibited-activities" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      6. Prohibited Activities
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      You agree not to engage in any of the following prohibited activities:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe upon the rights of others</li>
                      <li>Transmit any harmful, offensive, or inappropriate content</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Interfere with or disrupt the website or servers</li>
                      <li>Use automated systems to access the website without permission</li>
                      <li>Collect or harvest information about other users</li>
                      <li>Impersonate any person or entity</li>
                      <li>Engage in any form of spam or unsolicited communications</li>
                    </ul>
                  </section>

                  {/* Termination */}
                  <section id="termination" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      7. Termination
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      We reserve the right to terminate or suspend your account and access to our website immediately,
                      without prior notice or liability, for any reason, including if you breach these Terms.
                    </p>
                    <p className="text-muted-foreground">
                      Upon termination, your right to use the website will cease immediately. All provisions of these
                      Terms that by their nature should survive termination shall survive, including ownership
                      provisions, warranty disclaimers, and limitations of liability.
                    </p>
                  </section>

                  {/* Disclaimers */}
                  <section id="disclaimers" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      8. Disclaimers
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      THE INFORMATION ON THIS WEBSITE IS PROVIDED ON AN "AS IS" BASIS. TO THE FULLEST EXTENT PERMITTED
                      BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
                      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                    <p className="text-muted-foreground">
                      We do not warrant that the website will be available at all times, be secure, or be free from
                      errors, viruses, or other harmful components.
                    </p>
                  </section>

                  {/* Limitation of Liability */}
                  <section id="limitation-liability" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      9. Limitation of Liability
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ST. ANTHONY CATHOLIC CHURCH, GBAJA, ITS
                      OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                      CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR
                      OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE WEBSITE.
                    </p>
                    <p className="text-muted-foreground">
                      Our total liability to you for all claims arising from or related to the use of our website shall
                      not exceed the amount you paid to us, if any, in the twelve months prior to the action giving
                      rise to liability.
                    </p>
                  </section>

                  {/* Indemnification */}
                  <section id="indemnification" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      10. Indemnification
                    </h2>
                    <p className="text-muted-foreground">
                      You agree to indemnify, defend, and hold harmless St. Anthony Catholic Church, Gbaja and its
                      officers, directors, employees, and agents from and against any claims, liabilities, damages,
                      losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected
                      with your access to or use of the website, your violation of these Terms, or your violation of
                      any rights of another.
                    </p>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      11. Governing Law
                    </h2>
                    <p className="text-muted-foreground">
                      These Terms shall be governed by and construed in accordance with the laws of Nigeria, without
                      regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the
                      website shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.
                    </p>
                  </section>

                  {/* Changes to Terms */}
                  <section id="changes" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      12. Changes to Terms
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      We reserve the right to modify these Terms at any time. We will notify users of any material
                      changes by:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                      <li>Posting the updated Terms on this page</li>
                      <li>Updating the "Last updated" date</li>
                      <li>Sending an email notification (for significant changes)</li>
                    </ul>
                    <p className="text-muted-foreground">
                      Your continued use of the website after any changes constitutes acceptance of the new Terms. If you
                      do not agree to the modified Terms, you must stop using the website.
                    </p>
                  </section>

                  {/* Contact */}
                  <section id="contact" className="mb-12 scroll-mt-24">
                    <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                      13. Contact Us
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <Card className="p-6 bg-church-pearl">
                      <div className="space-y-2 text-muted-foreground">
                        <p>
                          <strong className="text-church-charcoal">St. Anthony Catholic Church, Gbaja</strong>
                        </p>
                        <p>123 Gbaja Street, Surulere, Lagos</p>
                        <p>Email: legal@stanthonygbaja.org</p>
                        <p>Phone: (234) 234 567 8910</p>
                      </div>
                    </Card>
                  </section>

                  {/* Accept Terms CTA */}
                  <section className="mt-12 pt-8 border-t">
                    <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-heading font-semibold mb-2 text-church-charcoal">
                            Accept Terms of Service
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            By clicking "Accept Terms," you acknowledge that you have read, understood, and agree to be
                            bound by these Terms of Service.
                          </p>
                        </div>
                        <Button
                          onClick={handleAcceptTerms}
                          variant="church"
                          size="lg"
                          disabled={accepted}
                          className="shrink-0"
                        >
                          {accepted ? (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Terms Accepted
                            </>
                          ) : (
                            "Accept Terms"
                          )}
                        </Button>
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

export default TermsOfService;
