import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, ChevronRight, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
}

const CookiePolicy = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always enabled
    analytics: false,
    personalization: false,
    marketing: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

  useEffect(() => {
    document.title = "Cookie Policy | St. Anthony Catholic Church, Gbaja";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Learn about how St. Anthony Catholic Church, Gbaja uses cookies and manage your cookie preferences."
      );
    }

    // Load saved preferences from localStorage (defer setState to satisfy lint rule)
    const t = setTimeout(() => {
      const savedPreferences = localStorage.getItem("cookiePreferences");
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences) as CookiePreferences;
          setPreferences(parsed);
          setHasLoadedPreferences(true);
        } catch (e) {
          console.error("Error loading cookie preferences:", e);
          setHasLoadedPreferences(true);
        }
      } else {
        // Show modal if preferences haven't been set
        const cookieConsent = localStorage.getItem("cookieConsent");
        if (!cookieConsent) {
          setShowModal(true);
        }
        setHasLoadedPreferences(true);
      }
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "essential") return; // Essential cookies cannot be disabled
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    localStorage.setItem("cookieConsent", "true");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been saved successfully.",
    });

    setShowModal(false);
    
    // Apply cookie preferences (in a real app, you would initialize analytics/tracking here)
    applyCookiePreferences(preferences);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    handleSavePreferences();
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      personalization: false,
      marketing: false,
    };
    setPreferences(onlyEssential);
    handleSavePreferences();
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // In a real application, you would initialize or disable tracking scripts here
    // For example:
    // if (prefs.analytics) {
    //   initializeGoogleAnalytics();
    // } else {
    //   disableGoogleAnalytics();
    // }
    console.log("Applying cookie preferences:", prefs);
  };

  const cookieCategories = [
    {
      id: "essential" as keyof CookiePreferences,
      title: "Essential Cookies",
      description:
        "These cookies are necessary for the website to function properly. They enable basic features like page navigation and access to secure areas. These cookies cannot be disabled.",
      required: true,
    },
    {
      id: "analytics" as keyof CookiePreferences,
      title: "Analytics Cookies",
      description:
        "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and user experience.",
      required: false,
    },
    {
      id: "personalization" as keyof CookiePreferences,
      title: "Personalization Cookies",
      description:
        "These cookies allow the website to remember choices you make (such as your language preference) and provide enhanced, personalized features.",
      required: false,
    },
    {
      id: "marketing" as keyof CookiePreferences,
      title: "Marketing Cookies",
      description:
        "These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.",
      required: false,
    },
  ];

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
                <BreadcrumbPage>Cookie Policy</BreadcrumbPage>
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
              <Cookie className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-church-charcoal">
              Cookie Policy
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Learn about how we use cookies and manage your preferences.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Cookie Preferences
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                What Are Cookies?
              </h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-muted-foreground">
                At St. Anthony Catholic Church, Gbaja, we use cookies to enhance your browsing experience, analyze
                website traffic, and personalize content. This Cookie Policy explains what cookies are, how we use them,
                and how you can manage your cookie preferences.
              </p>
            </section>

            {/* Cookie Categories */}
            <section className="mb-12">
              <h2 className="text-3xl font-heading font-bold mb-6 text-church-charcoal">
                Types of Cookies We Use
              </h2>
              <div className="space-y-6">
                {cookieCategories.map((category) => (
                  <Card key={category.id} className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-semibold mb-2 text-church-charcoal">
                          {category.title}
                        </h3>
                        <p className="text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {category.required ? (
                          <span className="text-sm font-semibold text-primary">Required</span>
                        ) : (
                          <>
                            <Label htmlFor={category.id} className="cursor-pointer">
                              {preferences[category.id] ? "Enabled" : "Disabled"}
                            </Label>
                            <Switch
                              id={category.id}
                              checked={preferences[category.id]}
                              onCheckedChange={(checked) =>
                                handlePreferenceChange(category.id, checked)
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Cookie Preferences Panel */}
            <section className="mb-12">
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
                <h2 className="text-2xl font-heading font-semibold mb-4 text-church-charcoal">
                  Manage Your Cookie Preferences
                </h2>
                <p className="text-muted-foreground mb-6">
                  You can control and manage cookies in various ways. Please keep in mind that removing or blocking
                  cookies can impact your user experience and parts of our website may no longer be fully accessible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => setShowModal(true)} variant="church" size="lg">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Preferences
                  </Button>
                  <Button onClick={handleSavePreferences} variant="outline" size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            </section>

            {/* Browser Settings */}
            <section className="mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                Browser Settings
              </h2>
              <p className="text-muted-foreground mb-4">
                Most web browsers allow you to control cookies through their settings preferences. However, limiting
                cookies may impact your ability to use our website. Here are links to help you manage cookies in popular
                browsers:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </section>

            {/* Third-Party Cookies */}
            <section className="mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                Third-Party Cookies
              </h2>
              <p className="text-muted-foreground mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics
                of the website, deliver advertisements, and so on. These third-party cookies are governed by the
                respective privacy policies of those third parties.
              </p>
            </section>

            {/* Updates */}
            <section className="mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4 text-church-charcoal">
                Updates to This Policy
              </h2>
              <p className="text-muted-foreground mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                new Cookie Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 15, 2024
              </p>
            </section>

            {/* Contact */}
            <section>
              <Card className="p-6 bg-church-pearl">
                <h2 className="text-2xl font-heading font-semibold mb-4 text-church-charcoal">
                  Contact Us
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
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
      </section>

      {/* Cookie Preferences Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies below. Essential
              cookies cannot be disabled as they are necessary for the website to function.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {cookieCategories.map((category) => (
              <Card key={category.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-church-charcoal">{category.title}</h3>
                      {category.required && (
                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {category.required ? (
                      <Switch checked={true} disabled />
                    ) : (
                      <Switch
                        checked={preferences[category.id]}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(category.id, checked)
                        }
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleRejectAll} variant="outline" className="w-full sm:w-auto">
              Reject All
            </Button>
            <Button onClick={handleAcceptAll} variant="outline" className="w-full sm:w-auto">
              Accept All
            </Button>
            <Button onClick={handleSavePreferences} variant="church" className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CookiePolicy;
