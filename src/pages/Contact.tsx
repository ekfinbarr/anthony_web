import PageHeader from "@/components/layout/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactHours from "@/components/contact/ContactHours";
import ContactMap from "@/components/contact/ContactMap";
import ContactSocial from "@/components/contact/ContactSocial";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import churchHero from "@/assets/church-hero.webp";

const Contact = () => {
  const { contact } = usePublicSiteSettings();

  return (
    <div>
      <PageHeader
        title="Contact Us"
        description="We'd love to hear from you — reach the parish office or send a message"
        image={{
          src: churchHero,
          alt: "Exterior view of St. Anthony Catholic Church, Gbaja",
        }}
      />

      <section
        aria-labelledby="contact-form-heading"
        className="scroll-mt-24 bg-background py-16 md:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <ContactForm />
            <ContactInfo contact={contact} />
          </div>
        </div>
      </section>

      <ContactHours />
      <ContactMap />
      <ContactSocial social={contact.social} />
    </div>
  );
};

export default Contact;
