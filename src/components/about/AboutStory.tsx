import Reveal from "@/components/parish-home/Reveal";
import AboutStorySlider from "./AboutStorySlider";

const AboutStory = () => {
  return (
    <section id="our-story" aria-labelledby="our-story-heading" className="scroll-mt-24 bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal from="left">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">Our heritage</p>
              <h2 id="our-story-heading" className="mb-6 font-heading text-3xl font-bold text-church-charcoal accent-line md:text-4xl">
                Our Story
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                <p>
                  St. Anthony, Gbaja began in 1985 with a small group of families gathering in a living room,
                  united by a shared vision to create a church that would impact our community with God&apos;s love.
                </p>
                <p>
                  Over the years, we&apos;ve grown from that humble beginning into a vibrant community of believers
                  from all walks of life. Our journey has been marked by God&apos;s faithfulness, countless changed
                  lives, and a deepening commitment to serve our city and beyond.
                </p>
                <p>
                  Today, St. Anthony, Gbaja is home to over 1,500 members who are passionate about worship,
                  discipleship, and making a difference in the world. We continue to be guided by the same
                  vision that started it all: to be a beacon of hope and love in our community.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal from="right" delay={80}>
            <div className="relative">
              <AboutStorySlider />
              <div
                className="pointer-events-none absolute -bottom-5 -right-5 hidden h-28 w-28 bg-gradient-church opacity-25 shape-diamond sm:block"
                aria-hidden="true"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutStory;
