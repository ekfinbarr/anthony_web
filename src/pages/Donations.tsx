import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Copy, CheckCircle, CreditCard, Heart, Landmark, Upload } from "lucide-react";
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
import {
  FUND_TONE,
  fundMeta,
  givingCategories as donationCategories,
  type GivingCategory,
} from "@/components/donations/givingCategories";
import { cn } from "@/lib/utils";
import GivingImpactSlider from "@/components/donations/GivingImpactSlider";

const PAYMENT_TABS = [
  { value: "online", icon: CreditCard, label: "Give Online", short: "Online" },
  { value: "bank", icon: Landmark, label: "Bank Transfer", short: "Transfer" },
  { value: "receipt", icon: Upload, label: "Upload Receipt", short: "Receipt" },
];

/** Small gold sparkles behind the selected fund's heading. */
function GivingSparkles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 112" fill="currentColor" aria-hidden className={className}>
      <circle cx="122" cy="40" r="34" opacity="0.08" />
      <circle cx="140" cy="86" r="18" opacity="0.06" />
      <path d="M92 20l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" opacity="0.35" className="motion-safe:animate-pulse" />
      <path d="M134 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" opacity="0.3" />
      <path d="M116 70l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" opacity="0.25" className="motion-safe:animate-pulse" />
    </svg>
  );
}

const Donations = () => {
  const [selectedCategory, setSelectedCategory] = useState(donationCategories[0]);
  const [copiedAccount, setCopiedAccount] = useState("");
  const [receiptAmount, setReceiptAmount] = useState<number | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [donationAccounts, setDonationAccounts] = useState<DonationAccount[]>([]);
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const selectedTone = FUND_TONE[fundMeta(selectedCategory.type).tone];

  // Picking a fund takes the giver straight to the form, so they see what changed.
  const chooseCategory = (category: GivingCategory) => {
    setSelectedCategory(category);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      headingRef.current?.focus({ preventScroll: true });
    });
  };

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
        // description="Your generosity helps us serve God and our community"
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
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-heading font-bold">
            Choose a <span className="text-primary">Giving Category</span>
          </h2>
          <p className="mb-8 text-center text-muted-foreground md:mb-12">Tap a fund and we'll take you to the giving form.</p>

          <div
            role="radiogroup"
            aria-label="Giving category"
            className="mx-auto mb-12 flex max-w-xl flex-col gap-3 md:grid md:max-w-none md:grid-cols-2 md:gap-6 lg:grid-cols-4"
          >
            {donationCategories.map((category, index) => {
              const Icon = category.icon;
              const isSelected = selectedCategory.id === category.id;
              const tone = FUND_TONE[fundMeta(category.type).tone];
              return (
                <button
                  key={category.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => chooseCategory(category)}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className={cn(
                    "group relative flex items-center gap-4 overflow-hidden rounded-xl border-2 bg-card p-4 text-left shadow-sm transition-all duration-300 [animation-fill-mode:both] motion-safe:animate-fade-in",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "md:flex-col md:px-6 md:pb-6 md:pt-8 md:text-center",
                    isSelected
                      ? cn(tone.ring, tone.bg, "shadow-md md:motion-safe:-translate-y-1")
                      : "border-border hover:shadow-md motion-safe:hover:-translate-y-0.5",
                  )}
                >
                  {/* Fund colour: a bar on the left on phones, along the top on larger screens. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-1 transition-opacity duration-300 md:inset-x-0 md:bottom-auto md:h-1 md:w-auto",
                      tone.bar,
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                    )}
                  />
                  <span className="relative shrink-0">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -inset-2 rounded-full blur-md transition-opacity duration-500",
                        tone.soft,
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <Icon
                      size="md"
                      className="relative transition-transform duration-300 motion-safe:group-hover:scale-105 md:h-20 md:w-20"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold md:mb-2 md:text-lg">{category.name}</span>
                    <span className="block text-sm text-muted-foreground">{category.description}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 md:absolute md:right-3 md:top-3",
                      isSelected
                        ? cn(tone.bar, "border-transparent text-white motion-safe:animate-scale-in")
                        : "border-border text-muted-foreground md:opacity-0",
                    )}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 md:hidden" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Category Details */}
          <Card ref={formRef} className="mx-auto max-w-3xl scroll-mt-24 overflow-hidden">
            <CardHeader
              key={selectedCategory.id}
              className={cn("relative overflow-hidden border-b motion-safe:animate-fade-in", selectedTone.bg)}
            >
              <GivingSparkles className={cn("pointer-events-none absolute -right-4 -top-2 h-28 w-40 opacity-70", selectedTone.text)} />
              <p className={cn("relative text-xs font-semibold uppercase tracking-wider", selectedTone.text)}>You're giving to</p>
              <CardTitle className="relative flex items-center gap-3">
                {/* Parish icons draw their own gold disc. */}
                <selectedCategory.icon size="sm" className="motion-safe:animate-scale-in" />
                <span ref={headingRef} tabIndex={-1} className="focus:outline-none">
                  {selectedCategory.name}
                </span>
              </CardTitle>
              <CardDescription className="relative">{selectedCategory.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-6 sm:px-6">
              <Tabs defaultValue="online" className="w-full">
                {/* On phones each method stacks a short label under its icon so all three fit. */}
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1">
                  {PAYMENT_TABS.map(({ value, icon: TabIcon, label, short }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="flex-col gap-1 whitespace-normal px-1 py-2 text-xs leading-tight sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
                    >
                      <TabIcon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="sm:hidden">{short}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="online" className="pt-2">
                  <OnlineDonationForm
                    donationType={selectedCategory.type}
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

      <GivingImpactSlider onGive={chooseCategory} />

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