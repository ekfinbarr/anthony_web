import { useEffect, useState } from "react";
import { Copy, CheckCircle, Heart } from "lucide-react";
import { BasketIcon, BricksIcon, CoinsIcon, GiftIcon } from "@/components/icons/ParishIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/use-toast";
import donationAccountService, { DonationAccount } from "@/services/donationAccount.service";
import OnlineDonationForm from "@/components/payments/OnlineDonationForm";
import AmountInput from "@/components/forms/AmountInput";
import ProofFileField from "@/components/forms/ProofFileField";
import { DonationType } from "@/services/payment.service";

// Each giving category maps to a backend donation type
const DONATION_TYPES: Record<string, DonationType> = {
  projects: "building",
  charity: "welfare",
  freewill: "offering",
  tithe: "tithe",
};

const donationCategories = [
  {
    id: "projects",
    name: "Parish Projects",
    icon: BricksIcon,
    description: "Support ongoing construction and renovation projects",
    bankDetails: {
      bankName: "First Bank of Nigeria",
      accountName: "St. Anthony Catholic Church Projects",
      accountNumber: "2034567890",
    },
  },
  {
    id: "charity",
    name: "Charity & Welfare",
    icon: BasketIcon,
    description: "Help the less privileged in our community",
    bankDetails: {
      bankName: "Zenith Bank",
      accountName: "St. Anthony Catholic Church Charity",
      accountNumber: "1098765432",
    },
  },
  {
    id: "freewill",
    name: "Freewill Offering",
    icon: GiftIcon,
    description: "General donations to support parish activities",
    bankDetails: {
      bankName: "GTBank",
      accountName: "St. Anthony Catholic Church Gbaja",
      accountNumber: "0123456789",
    },
  },
  {
    id: "tithe",
    name: "Tithe & Offerings",
    icon: CoinsIcon,
    description: "Regular tithes and thanksgiving offerings",
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
  const [receiptAmount, setReceiptAmount] = useState<number | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState("");
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
    if (!receiptFile) {
      setReceiptError("Upload a photo or PDF of your receipt.");
      return;
    }
    setReceiptError("");
    toast({
      title: "Receipt Submitted",
      description: "Thank you! Your donation receipt has been received.",
    });
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Support Our Parish"
        title="Donations & Giving"
        description="Your generosity helps us serve God and our community"
      />

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
                    <Icon size="lg" className="mx-auto mb-4" />
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
                {/* Parish icons draw their own gold disc. */}
                <selectedCategory.icon size="sm" />
                {selectedCategory.name}
              </CardTitle>
              <CardDescription>{selectedCategory.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="online" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="online">Give Online</TabsTrigger>
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                  <TabsTrigger value="receipt">Upload Receipt</TabsTrigger>
                </TabsList>

                <TabsContent value="online" className="pt-2">
                  <OnlineDonationForm
                    donationType={DONATION_TYPES[selectedCategory.id] ?? "other"}
                    purposeLabel={selectedCategory.name}
                  />
                </TabsContent>

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
                      <AmountInput id="amount" value={receiptAmount} onValueChange={setReceiptAmount} placeholder="5,000.00" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receipt">Upload Receipt *</Label>
                      <ProofFileField
                        id="receipt"
                        value={receiptFile}
                        onChange={(file) => {
                          setReceiptFile(file);
                          if (file) setReceiptError("");
                        }}
                        aria-invalid={receiptError ? true : undefined}
                        aria-describedby={receiptError ? "receipt-error" : undefined}
                        aria-required
                      />
                      {receiptError && <p id="receipt-error" className="text-sm text-destructive" role="alert">{receiptError}</p>}
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