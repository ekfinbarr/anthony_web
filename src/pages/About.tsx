import PageHeader from "@/components/layout/PageHeader";
import AboutStory from "@/components/about/AboutStory";
import AboutGuidingPrinciples from "@/components/about/AboutGuidingPrinciples";
import AboutCoreValues from "@/components/about/AboutCoreValues";
import AboutWelcome from "@/components/about/AboutWelcome";
import AboutRegularActivities from "@/components/about/AboutRegularActivities";
import AboutLeadership from "@/components/about/AboutLeadership";
import AboutWorshipCta from "@/components/about/AboutWorshipCta";
import churchHero from "@/assets/church-hero.webp";

const About = () => {
  return (
    <div>
      <PageHeader
        title="About St. Anthony, Gbaja"
        description="A parish family of faith, welcome, and service in the heart of Surulere"
        image={{
          src: churchHero,
          alt: "Exterior view of St. Anthony Catholic Church, Gbaja",
        }}
      />

      <AboutStory />
      <AboutGuidingPrinciples />
      <AboutCoreValues />
      <AboutWelcome />
      <AboutRegularActivities />
      {/* <AboutLeadership /> */}
      <AboutWorshipCta />
    </div>
  );
};

export default About;
