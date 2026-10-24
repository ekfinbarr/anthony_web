import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { contactMessageService } from "@/services/contactMessage.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { notify } from "@/lib/notify";
import { ClockIcon, EnvelopeIcon, PhoneIcon, PinIcon } from "@/components/icons/ParishIcons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  type: z.enum(['general', 'prayer_request', 'complaint', 'suggestion', 'inquiry']),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      type: "general",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await notify.promise(contactMessageService.submit(values), {
        loading: "Sending your message…",
        success: "Message sent! We’ll get back to you soon.",
        error: (error) => getApiErrorMessage(error, "Failed to send message. Please try again later."),
      });
      form.reset();
    } catch {
      // Error already surfaced by notify.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Contact Us" description="We'd love to hear from you" />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Get in Touch</h2>
              <Card className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" {...form.register("name")} placeholder="Your name" />
                      {form.formState.errors.name && (
                        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...form.register("email")} placeholder="your@email.com" />
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" {...form.register("phone")} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Inquiry Type</Label>
                      <Select
                        defaultValue="general"
                        onValueChange={(val) => form.setValue("type", val as FormValues["type"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="prayer_request">Prayer Request</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="suggestion">Suggestion</SelectItem>
                          <SelectItem value="inquiry">Specific Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input id="subject" {...form.register("subject")} placeholder="What's this about?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      {...form.register("message")}
                      placeholder="Your message here..."
                    />
                    {form.formState.errors.message && (
                      <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                  <Button
                    variant="church"
                    size="lg"
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </div>

            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Visit Us</h2>
              <div className="space-y-4">
                <Card className="p-6">
                  <PinIcon size="md" className="mb-3" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    123 Church Street<br />
                    City, ST 12345
                  </p>
                </Card>
                <Card className="p-6">
                  <PhoneIcon size="md" className="mb-3" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Phone</h3>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </Card>
                <Card className="p-6">
                  <EnvelopeIcon size="md" className="mb-3" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground">info@gracechurch.org</p>
                </Card>
                <Card className="p-6">
                  <ClockIcon size="md" className="mb-3" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Office Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday: 10:00 AM - 2:00 PM<br />
                    Sunday: Closed
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;