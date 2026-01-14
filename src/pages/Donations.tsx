import { useEffect, useState } from "react";
import { Heart, Building2, Gift, HandHeart, Upload, CreditCard, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import donationAccountService, { DonationAccount } from "@/services/donationAccount.service";

const donationCategories = [
  {
    id: "projects",
    name: "Parish Projects",
    icon: Building2,
    description: "Support ongoing construction and renovation projects",
    color: "bg-blue-500",
    bankDetails: {
      bankName: "First Bank of Nigeria",
      accountName: "St. Anthony Catholic Church Projects",
      accountNumber: "2034567890",
    },
  },
  {
    id: "charity",
    name: "Charity & Welfare",
    icon: HandHeart,
    description: "Help the less privileged in our community",
    color: "bg-green-500",
    bankDetails: {
      bankName: "Zenith Bank",
      accountName: "St. Anthony Catholic Church Charity",
      accountNumber: "1098765432",
    },
  },
  {
    id: "freewill",
    name: "Freewill Offering",
    icon: Gift,
    description: "General donations to support parish activities",
    color: "bg-purple-500",
    bankDetails: {
      bankName: "GTBank",
      accountName: "St. Anthony Catholic Church Gbaja",
      accountNumber: "0123456789",
    },
  },
  {
    id: "tithe",
    name: "Tithe & Offerings",
    icon: Heart,
    description: "Regular tithes and thanksgiving offerings",
    color: "bg-primary",
    bankDetails: {
      bankName: "UBA",
      accountName: "St. Anthony Catholic Church Tithe",
      accountNumber: "3456789012",
    },
  },
];

const Donations = () => {
  const [selectedCategory, setSelectedCategory] = useState(donationCategories[0]);
  const [copiedAccount, setCopiedAccount] = useState("");
  const [donationAccounts, setDonationAccounts] = useState<DonationAccount[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await donationAccountService.listActive();
        setDonationAccounts(response.data || []);
      } catch {
        // Keep UI functional even if backend isn't reachable yet
        setDonationAccounts([]);
      }
    };

    loadAccounts();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedAccount(""), 2000);
  };

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Receipt Submitted",
      description: "Thank you! Your donation receipt has been received.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200"
            alt="Giving"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary/60" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <Badge className="mb-4 bg-primary text-primary-foreground">Support Our Parish</Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-in">
            Donations & <span className="text-primary">Giving</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto px-4 opacity-90">
            Your generosity helps us serve God and our community
          </p>
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg italic">
            "Each of you should give what you have decided in your heart to give, not reluctantly or
            under compulsion, for God loves a cheerful giver."
          </p>
          <p className="mt-2 font-semibold">— 2 Corinthians 9:7</p>
        </div>
      </section>

      {/* Donation Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Choose a <span className="text-primary">Giving Category</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {donationCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory.id === category.id;
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 ${isSelected ? "ring-2 ring-primary scale-105" : "hover:scale-102"
                    }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    {/* Hide description on mobile */}
                    <p className="text-sm text-muted-foreground hidden md:block text-center">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Category Details */}
          <Card className="max-w-3xl mx-auto animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedCategory.color} flex items-center justify-center`}>
                  <selectedCategory.icon className="h-5 w-5 text-white" />
                </div>
                {selectedCategory.name}
              </CardTitle>
              <CardDescription>{selectedCategory.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bank" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                  <TabsTrigger value="receipt">Upload Receipt</TabsTrigger>
                </TabsList>

                <TabsContent value="bank" className="space-y-4">
                  <div className="bg-muted rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold">Bank Account Details</h4>

                    {donationAccounts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Donation accounts are not available right now. Please contact the parish office for bank details.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {donationAccounts.map((acc) => (
                          <div key={acc.id} className="p-4 bg-background rounded-md space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{acc.name}</div>
                              <Badge variant="secondary">{acc.currency}</Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="p-3 bg-muted/40 rounded">
                                <p className="text-sm text-muted-foreground">Bank Name</p>
                                <p className="font-medium">{acc.bank_name}</p>
                              </div>

                              <div className="p-3 bg-muted/40 rounded flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Account Name</p>
                                  <p className="font-medium">{acc.account_name}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(acc.account_name, "Account name")}
                                >
                                  {copiedAccount === acc.account_name ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              <div className="p-3 bg-muted/40 rounded flex items-center justify-between gap-2 md:col-span-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Account Number</p>
                                  <p className="font-medium text-xl">{acc.account_number}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(acc.account_number, "Account number")}
                                >
                                  {copiedAccount === acc.account_number ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {acc.instructions && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Instructions:</strong> {acc.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    After making your transfer, please upload your receipt to help us track your donation.
                  </p>
                </TabsContent>

                <TabsContent value="receipt">
                  <form onSubmit={handleReceiptSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="donor-name">Your Name *</Label>
                        <Input id="donor-name" placeholder="Full name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-phone">Phone Number *</Label>
                        <Input id="donor-phone" type="tel" placeholder="+234..." required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donor-email">Email Address</Label>
                      <Input id="donor-email" type="email" placeholder="your@email.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount Donated *</Label>
                      <Input id="amount" type="number" placeholder="Enter amount in Naira" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receipt">Upload Receipt *</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Click to upload or drag and drop
                        </p>
                        <Input id="receipt" type="file" className="hidden" accept="image/*,.pdf" />
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("receipt")?.click()}>
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" placeholder="Any message you'd like to include..." />
                    </div>

                    <Button type="submit" className="w-full" variant="church">
                      Submit Donation Receipt
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Online Payment Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Prefer to <span className="text-primary">Pay Online?</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Coming soon! We're working on integrating online payment options for your convenience.
          </p>
          <Button variant="outline" size="lg" disabled className="gap-2">
            <CreditCard className="h-5 w-5" />
            Online Payment Coming Soon
          </Button>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 mx-auto text-primary mb-6" />
          <h2 className="text-3xl font-heading font-bold mb-4">Thank You for Your Generosity</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Your donations make a real difference in our parish and community. May God bless you
            abundantly for your kindness and generosity.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Donations;