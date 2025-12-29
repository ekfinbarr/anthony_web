import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pastPriests = [
  { id: 1, name: "Rev. Fr. Michael Adeyemi", years: "1965 - 1972", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", description: "Founding parish priest who established St. Anthony Catholic Church, Gbaja. Under his leadership, the first church building was constructed.", summary: "Built the foundation of our parish community." },
  { id: 2, name: "Rev. Fr. Patrick Okonkwo", years: "1972 - 1979", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300", description: "Expanded the parish school and established the first youth ministry programs.", summary: "Pioneer of youth evangelization." },
  { id: 3, name: "Rev. Fr. Joseph Akinola", years: "1979 - 1984", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", description: "Initiated the building of the parish hall and strengthened community outreach programs.", summary: "Builder of community spaces." },
  { id: 4, name: "Rev. Fr. Emmanuel Nwachukwu", years: "1984 - 1990", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300", description: "Established the Legion of Mary and other pious societies in the parish.", summary: "Champion of lay apostolate." },
  { id: 5, name: "Rev. Fr. Anthony Obi", years: "1990 - 1995", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", description: "Oversaw the renovation of the main church and introduced charismatic renewal.", summary: "Spiritual renewal advocate." },
  { id: 6, name: "Rev. Fr. Bernard Eze", years: "1995 - 2000", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300", description: "Launched the parish clinic and health center to serve the community.", summary: "Healthcare ministry pioneer." },
  { id: 7, name: "Rev. Fr. Charles Okoro", years: "2000 - 2004", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", description: "Modernized parish administration and introduced computer systems.", summary: "Modernization champion." },
  { id: 8, name: "Rev. Fr. David Iwu", years: "2004 - 2008", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300", description: "Expanded the parish bookshop and established adult catechism classes.", summary: "Education and formation leader." },
  { id: 9, name: "Rev. Fr. Francis Uche", years: "2008 - 2011", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", description: "Initiated the construction of the new multipurpose hall.", summary: "Infrastructure developer." },
  { id: 10, name: "Rev. Fr. Gabriel Onyema", years: "2011 - 2014", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300", description: "Strengthened ecumenical relations and community partnerships.", summary: "Unity and dialogue promoter." },
  { id: 11, name: "Rev. Fr. Henry Nnamdi", years: "2014 - 2017", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", description: "Launched the parish social media presence and online streaming of masses.", summary: "Digital evangelization pioneer." },
  { id: 12, name: "Rev. Fr. Isaac Chukwu", years: "2017 - 2019", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300", description: "Established the parish emergency response committee and welfare programs.", summary: "Social welfare advocate." },
  { id: 13, name: "Rev. Fr. James Okoli", years: "2019 - 2021", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", description: "Guided the parish through the COVID-19 pandemic with innovative solutions.", summary: "Crisis leadership exemplar." },
  { id: 14, name: "Rev. Fr. Kenneth Amadi", years: "2021 - 2023", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300", description: "Revitalized youth programs and established mentorship initiatives.", summary: "Youth empowerment champion." },
  { id: 15, name: "Rev. Fr. Lawrence Agu", years: "2023 - Present", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", description: "Current parish priest continuing the legacy of faith and service.", summary: "Current shepherd of our flock." },
];

const PastPriests = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-secondary via-secondary/90 to-primary/20" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <Badge className="mb-4 bg-primary text-primary-foreground">Our Heritage</Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-in">
            Past <span className="text-primary">Parish Priests</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto px-4 opacity-90">
            Honoring the shepherds who have guided our parish through the years
          </p>
        </div>
      </section>

      {/* Timeline Introduction */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Since 1965, St. Anthony Catholic Church, Gbaja has been blessed with dedicated priests 
            who have served our community with faith, love, and commitment. Each priest has left 
            an indelible mark on our parish history.
          </p>
        </div>
      </section>

      {/* Priests Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastPriests.map((priest, index) => (
              <Card 
                key={priest.id} 
                className="group overflow-hidden card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={priest.image}
                      alt={priest.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary/90 to-transparent p-4">
                    <Badge className="bg-primary text-primary-foreground">{priest.years}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2">{priest.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{priest.summary}</p>
                  <p className="text-sm text-muted-foreground">{priest.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl text-primary mb-6">"</div>
            <blockquote className="text-2xl md:text-3xl font-heading italic mb-6">
              Remember your leaders who spoke the word of God to you. Consider the outcome of their 
              way of life and imitate their faith.
            </blockquote>
            <cite className="text-primary font-semibold">— Hebrews 13:7</cite>
          </div>
        </div>
      </section>

      {/* Prayer Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl font-heading font-bold mb-6">Prayer for Our Priests</h2>
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <p className="text-muted-foreground italic leading-relaxed">
              Lord Jesus Christ, eternal High Priest, we pray for all priests who have served and 
              continue to serve in our parish. Bless those who have gone before us with eternal rest, 
              and strengthen those who continue to minister to Your people. May their lives inspire 
              us to grow in holiness and service. Amen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PastPriests;