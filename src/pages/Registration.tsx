import PageHeader from "@/components/layout/PageHeader";
import RegistrationWizard from "@/components/registration/RegistrationWizard";

const Registration = () => {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Join Our Parish"
        title="Parish Registration"
        description="New to Gbaja, returning to the Church or exploring the faith, there is a place for you at St. Anthony Catholic Church."
      />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <RegistrationWizard />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;
