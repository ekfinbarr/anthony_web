import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { cn } from "@/lib/utils";
import FAQSchema from "@/components/seo/schemas/FAQSchema";
import PageHeader from "@/components/layout/PageHeader";
import { formatAddress, site } from "@/config/site";
import {
  baptismSchedule,
  formatService,
  massTimesAnswer,
  otherServices,
  parishOfficeHours,
} from "@/config/parish";

const confessions = otherServices.find((service) => service.name === "Confessions");
const phoneSentence = site.telephone ? ` or by phone on ${site.telephone}` : "";
const contactCardCount = 2 + (site.telephone ? 1 : 0) + (site.social.whatsapp ? 1 : 0);

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      category: "General Information",
      questions: [
        {
          question: "What are the Mass times?",
          answer: `${massTimesAnswer()} Please arrive 15 minutes early for seating.`
        },
        ...(confessions
          ? [{
              question: "When are Confessions heard?",
              answer: `Confessions are heard on ${formatService(confessions)}.`
            }]
          : []),
        {
          question: "Where is the Parish Office located?",
          answer: `The Parish Office is located at the main church building, ${site.name}, ${formatAddress(site.address)}. Office hours are ${parishOfficeHours.sentence}.`
        },
        {
          question: "How can I contact the Parish Office?",
          answer: `You can email the Parish Office at ${site.email}${phoneSentence}, send a message from our Contact page, or visit us during office hours.`
        }
      ]
    },
    {
      category: "Sacraments",
      questions: [
        {
          question: "How do I register for Baptism?",
          answer: `Baptisms are celebrated on the ${baptismSchedule.details}. To register, please contact the Parish Office at least 2 weeks in advance. Parents must attend a Baptism preparation class. Required documents include birth certificate and godparent certificates.`
        },
        {
          question: "What are the requirements for Confirmation?",
          answer: "Confirmation candidates must be at least 16 years old, have completed religious education classes, and be in good standing with the Church. A sponsor is required."
        },
        {
          question: "How do I book for Marriage classes?",
          answer: "Marriage classes are held quarterly. Contact the Parish Office to register. Couples must complete the classes at least 6 months before the wedding date."
        }
      ]
    },
    {
      category: "Parish Services",
      questions: [
        {
          question: "How do I book for a Mass intention?",
          answer: "Mass intentions can be booked online on our Book a Mass page, or through the Parish Office."
        },
        {
          question: "How do I join a society or ministry?",
          answer: "Visit our ministries page or contact the Parish Office to learn about available societies and ministries. We have groups for all ages and interests."
        }
      ]
    },
    {
      category: "Website & Portal",
      questions: [
        {
          question: "How do I create an account on the parish website?",
          answer: "Click on 'Register' in the navigation menu. Fill out the registration form with your personal information. You'll receive a confirmation email to activate your account."
        },
        {
          question: "What should I do if I forget my password?",
          answer: "Click on 'Login' and then 'Forgot Password'. Enter your email address and follow the instructions sent to your email to reset your password."
        }
      ]
    },
    {
      category: "Donations & Support",
      questions: [
        {
          question: "How can I give online or support parish projects?",
          answer: "You can make online donations through our website by clicking on 'Give' in the navigation. We also accept checks and cash at the Parish Office."
        }
      ]
    }
  ];

  const filteredFaqs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen">
      <FAQSchema items={faqData.flatMap((category) => category.questions)} />
      <PageHeader
        title="Frequently Asked Questions (FAQ)"
        description="Find quick answers to common parish enquiries."
      />

      {/* Search Bar */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <label htmlFor="faq-search" className="sr-only">Search frequently asked questions</label>
            <Input
              id="faq-search"
              type="search"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {filteredFaqs.map((category, index) => (
            <div key={index} className="mb-12">
              <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-8 text-center">
                {category.category}
              </h2>
              <div className="max-w-4xl mx-auto">
                <FaqAccordion questions={category.questions} />
              </div>
            </div>
          ))}
          {filteredFaqs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No questions found matching "{searchTerm}". Try different keywords.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-6">
              Still Need Help?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find the answer you're looking for? Our parish team is here to help.
            </p>

            <div className={cn("grid md:grid-cols-2 gap-6 mb-8", contactCardCount === 4 && "lg:grid-cols-4", contactCardCount === 3 && "lg:grid-cols-3")}>
              {site.telephone && (
                <Card className="p-6 text-center">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-4" aria-hidden="true" />
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <a href={`tel:${site.telephone.replace(/[^+\d]/g, "")}`} className="text-sm text-muted-foreground hover:text-primary">{site.telephone}</a>
                </Card>
              )}

              <Card className="p-6 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" aria-hidden="true" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <a href={`mailto:${site.email}`} className="text-sm text-muted-foreground hover:text-primary break-all">{site.email}</a>
              </Card>

              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Office Hours</h3>
                <p className="text-sm text-muted-foreground">{parishOfficeHours.compact}</p>
              </Card>

              {site.social.whatsapp && (
                <Card className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" aria-hidden="true" />
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <a href={site.social.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">Chat with us on WhatsApp</a>
                </Card>
              )}
            </div>

            <Button variant="church" size="lg" asChild>
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
