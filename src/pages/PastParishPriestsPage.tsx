import { Card, CardContent } from "@/components/ui/card";

/**
 * PastParishPriestsPage Component
 *
 * Displays past parish priests and associate priests with their photos, names,
 * roles, years served, and brief profiles. Features a responsive card-based grid
 * layout highlighting the parish's history and legacy.
 */
const PastParishPriestsPage = () => {
  // Sample data for past parish priests and associate priests
  const priests = [
    {
      name: "Very Rev. Msgr. Bernard Okodua",
      role: "Parish Priest",
      years: "2018–Present",
      photo: "/assets/images/st_anthony.png", // Using existing image as placeholder
      bio: "Current parish priest leading the community with dedication and spiritual guidance, overseeing major renovations and community outreach programs."
    },
    {
      name: "Rev. Fr. Michael Adebayo",
      role: "Associate Priest",
      years: "2015–2018",
      photo: "/assets/images/st_anthony.png",
      bio: "Served as associate priest, focusing on youth ministry and sacramental preparation, fostering spiritual growth among the younger generation."
    },
    {
      name: "Rev. Fr. Joseph Nwosu",
      role: "Parish Priest",
      years: "2010–2015",
      photo: "/assets/images/st_anthony.png",
      bio: "Guided the parish through significant development, including the construction of new facilities and establishment of community outreach initiatives."
    },
    {
      name: "Rev. Fr. Anthony Eze",
      role: "Associate Priest",
      years: "2008–2010",
      photo: "/assets/images/st_anthony.png",
      bio: "Dedicated associate priest who strengthened the liturgical life of the parish and promoted vocations to the priesthood and religious life."
    },
    {
      name: "Rev. Fr. Peter Okoye",
      role: "Parish Priest",
      years: "2003–2008",
      photo: "/assets/images/st_anthony.png",
      bio: "Led the parish during a period of spiritual renewal, implementing various prayer groups and deepening the community's faith foundation."
    },
    {
      name: "Rev. Fr. Francis Okafor",
      role: "Associate Priest",
      years: "2000–2003",
      photo: "/assets/images/st_anthony.png",
      bio: "Focused on catechetical instruction and adult faith formation, helping parishioners deepen their understanding of Catholic teachings."
    },
    {
      name: "Rev. Fr. Gabriel Chukwu",
      role: "Parish Priest",
      years: "1995–2000",
      photo: "/assets/images/st_anthony.png",
      bio: "Established the foundation for many of the parish's current ministries and fostered a strong sense of community among parishioners."
    },
    {
      name: "Rev. Fr. Emmanuel Nnamdi",
      role: "Associate Priest",
      years: "1992–1995",
      photo: "/assets/images/st_anthony.png",
      bio: "Contributed to the development of the parish school and promoted educational excellence alongside spiritual formation."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/assets/images/church_banner.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 text-shadow-hero">
            Past Parish Priests & Associate Priests
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            "Honoring those who have shepherded our parish through the years."
          </p>
        </div>
      </section>

      {/* Priests Grid Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-4">
              Our Spiritual Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              These dedicated priests have guided our parish community with wisdom, compassion, and unwavering faith,
              leaving an indelible mark on our spiritual journey and parish legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {priests.map((priest, index) => (
              <Card
                key={index}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-lg"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={priest.photo}
                    alt={`Photo of ${priest.name}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-heading font-bold text-church-charcoal mb-2">
                      {priest.name}
                    </h3>
                    <div className="mb-3">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        {priest.role}
                      </span>
                      <p className="text-sm text-muted-foreground font-medium">
                        {priest.years}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {priest.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-16 bg-church-pearl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-church-charcoal mb-6">
            A Legacy of Faith
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8">
            Each priest who has served our parish has contributed uniquely to our community's spiritual growth
            and development. Their dedication, wisdom, and love continue to inspire us as we carry forward
            the mission of St. Anthony Catholic Church, Gbaja.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
              Spiritual Leadership
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
              Community Building
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
              Faith Formation
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
              Pastoral Care
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PastParishPriestsPage;
