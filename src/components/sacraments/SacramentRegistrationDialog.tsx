import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FieldHint from "@/components/forms/FieldHint";
import { useToast } from "@/hooks/use-toast";
import type { Sacrament } from "@/data/sacraments";

const registrationSchema = z.object({
  sacramentId: z.string().min(1, "Please select a sacrament"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  preferredDate: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

type SacramentRegistrationDialogProps = {
  sacrament: Sacrament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SacramentRegistrationDialog = ({
  sacrament,
  open,
  onOpenChange,
}: SacramentRegistrationDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      sacramentId: "",
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      preferredDate: "",
      additionalInfo: "",
    },
  });

  useEffect(() => {
    if (sacrament && open) {
      form.reset({
        sacramentId: sacrament.id,
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        preferredDate: "",
        additionalInfo: "",
      });
    }
  }, [sacrament, open, form]);

  const registrationMutation = useMutation({
    mutationFn: async (_data: RegistrationFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, id: `reg-${Date.now()}` };
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your sacrament registration has been submitted. We will contact you soon.",
      });
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {sacrament?.name}</DialogTitle>
          <DialogDescription>
            Please fill out the form below to register for {sacrament?.name}. We will contact you
            shortly.
          </DialogDescription>
        </DialogHeader>

        {sacrament && (
          <div className="mb-6 rounded-lg bg-church-pearl p-4">
            <h4 className="mb-2 font-semibold">Sacrament Information</h4>
            {sacrament.schedule && (
              <div className="mb-2 space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong>Schedule:</strong> {sacrament.schedule.date} at {sacrament.schedule.time}
                </p>
                <p>
                  <strong>Location:</strong> {sacrament.schedule.location}
                </p>
              </div>
            )}
            {sacrament.registrationDeadline && (
              <p className="text-sm text-muted-foreground">
                <strong>Registration Deadline:</strong> {sacrament.registrationDeadline}
              </p>
            )}
            <div className="mt-3">
              <p className="mb-1 text-sm font-semibold">Requirements:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {sacrament.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-1">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 border-t pt-3">
              <p className="mb-1 text-sm font-semibold">Contact Information:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong>Contact:</strong> {sacrament.contact.name}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${sacrament.contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {sacrament.contact.email}
                  </a>
                </p>
                {sacrament.contact.phone && (
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={`tel:${sacrament.contact.phone.replace(/[^+\d]/g, "")}`} className="text-primary hover:underline">
                      {sacrament.contact.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <FormLabel>
                      Full name <span className="text-destructive" aria-hidden="true">*</span>
                    </FormLabel>
                    <FieldHint text="First name and surname." />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Ada Okonkwo"
                      autoComplete="name"
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <FormLabel>
                        Email address <span className="text-destructive" aria-hidden="true">*</span>
                      </FormLabel>
                      <FieldHint text="Where the parish can write to you." />
                    </div>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <FormLabel>
                        Phone number <span className="text-destructive" aria-hidden="true">*</span>
                      </FormLabel>
                      <FieldHint text="Nigerian number, such as 080… or +234…" />
                    </div>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="0803 000 0000"
                        autoComplete="tel"
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <FormLabel>
                        Date of birth <span className="text-destructive" aria-hidden="true">*</span>
                      </FormLabel>
                      <FieldHint text="The day you were born." />
                    </div>
                    <FormControl>
                      <IsoDatePicker
                        aria-required
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <FormLabel>Preferred date</FormLabel>
                      <FieldHint text="Optional, if this sacrament allows a choice." />
                    </div>
                    <FormControl>
                      <IsoDatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <FormLabel>
                      Address <span className="text-destructive" aria-hidden="true">*</span>
                    </FormLabel>
                    <FieldHint text="Street and area." />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="14 Gbaja Road, Surulere"
                      autoComplete="street-address"
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <FormLabel>Additional information</FormLabel>
                    <FieldHint text="Optional. Anything else the parish should know." />
                  </div>
                  <FormControl>
                    <Textarea placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="church" disabled={registrationMutation.isPending}>
                {registrationMutation.isPending ? "Submitting..." : "Submit Registration"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SacramentRegistrationDialog;
