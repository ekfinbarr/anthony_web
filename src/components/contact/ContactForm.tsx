import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { contactMessageService } from "@/services/contactMessage.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Reveal from "@/components/parish-home/Reveal";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  type: z.enum(["general", "prayer_request", "complaint", "suggestion", "inquiry"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
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
    <Reveal from="left">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
          Write to us
        </p>
        <h2
          id="contact-form-heading"
          className="mb-2 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
        >
          Get in Touch
        </h2>
        <p className="mb-8 max-w-lg text-muted-foreground md:text-lg">
          Send a prayer request, ask a question, or share feedback. We read every message.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 rounded-lg border border-border/60 bg-background p-6 shadow-card-soft md:p-8"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" autoComplete="name" {...form.register("name")} placeholder="Your name" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
                placeholder="your@email.com"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...form.register("phone")}
                placeholder="+234 …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Inquiry Type</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
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
                )}
              />
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
              placeholder="Your message here…"
              className="min-h-[120px] resize-y"
            />
            {form.formState.errors.message && (
              <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
            )}
          </div>

          <Button
            variant="church"
            size="lg"
            className="w-full transition-transform duration-200 hover:scale-[1.01] motion-reduce:hover:scale-100"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </Reveal>
  );
};

export default ContactForm;
