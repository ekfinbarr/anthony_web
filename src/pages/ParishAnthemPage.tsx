import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Play } from "lucide-react";

/**
 * ParishAnthemPage Component
 *
 * Displays the parish anthem for St. Anthony Catholic Church, Gbaja.
 * Includes lyrics, audio player, and PDF download functionality.
 * Designed with a clean, liturgical-themed UI that respects the church's design system.
 */
const ParishAnthemPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-church-charcoal mb-4">
            Parish Anthem
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            St. Anthony Catholic Church, Gbaja
          </p>
        </div>
      </section>

      {/* Anthem Lyrics Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center mb-5">
          <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-8">
            Listen to the Anthem
          </h2>
          <Card className="p-8">
            <div className="flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-primary mr-2" />
              <span className="text-lg font-semibold text-church-charcoal">Parish Anthem Audio</span>
            </div>
            {/* Placeholder audio player */}
            <audio controls className="w-full">
              <source src="/assets/audio/sample-anthem.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm text-muted-foreground mt-4">
              Experience the melody that unites our community in worship.
            </p>
          </Card>
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {/* Verse 1 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-heading font-bold text-church-charcoal mb-6 uppercase tracking-wide">
                Verse 1
              </h2>
              <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
                <p>As we stand together as one people</p>
                <p>and we share as one family in Love</p>
                <p>Joined and bound in courage and compassion</p>
                <p>Like Saint Anthony our patron and guide</p>
              </div>
            </Card>

            {/* Chorus */}
            <Card className="p-8 hover:shadow-lg transition-shadow bg-church-pearl  bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
              <h2 className="text-2xl font-heading font-bold text-church-charcoal mb-6 uppercase tracking-wide">
                Chorus
              </h2>
              <div className="text-lg text-black leading-relaxed space-y-4">
                <p>Viva Anthony! Model of perfection</p>
                <p>Viva Anthony! Lover of the cross</p>
                <p>As we sing with love for one another,</p>
                <p>Bless our Church in God's name we pray</p>
              </div>
            </Card>

            {/* Verse 2 */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-heading font-bold text-church-charcoal mb-6 uppercase tracking-wide">
                Verse 2
              </h2>
              <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
                <p>God of grace give us the faith to serve you</p>
                <p>God of Life let our worship rise to thee</p>
                <p>Help us live and serve like Christ our brother</p>
                <p>Hear us Lord as we call your name</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Audio Section */}
      {/* <section className="py-16 bg-church-stone">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-8">
            Listen to the Anthem
          </h2>
          <Card className="p-8">
            <div className="flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-primary mr-2" />
              <span className="text-lg font-semibold text-church-charcoal">Parish Anthem Audio</span>
            </div>
            <audio controls className="w-full">
              <source src="/assets/audio/sample-anthem.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm text-muted-foreground mt-4">
              Experience the melody that unites our community in worship.
            </p>
          </Card>
        </div>
      </section> */}

      {/* Download Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-8">
            Download the Anthem
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Download the full anthem lyrics and music in PDF format for personal use or sharing with others.
          </p>
          <Button
            variant="church"
            size="lg"
            className="group"
            asChild
          >
            <a href="/assets/pdf/parish-anthem.pdf" download>
              <Download className="mr-2 group-hover:translate-y-1 transition-transform" />
              Download Anthem (PDF)
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ParishAnthemPage;
