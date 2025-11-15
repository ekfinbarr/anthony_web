import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Target, Eye, Heart, Users, Clock, MapPin, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Sample gallery data with images and videos
const galleryItems = [
  {
    id: 1,
    type: "image",
    title: "Sunday Worship Service",
    description: "A vibrant worship service filled with praise and worship.",
    src: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36",
    alt: "Worship service congregation singing hymns",
    category: "worship"
  },
  {
    id: 2,
    type: "image",
    title: "Community Outreach Program",
    description: "Serving our community through various outreach programs.",
    src: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36",
    alt: "Volunteers serving food at community outreach event",
    category: "outreach"
  },
  {
    id: 3,
    type: "image",
    title: "Youth Ministry Gathering",
    description: "Engaging and empowering the next generation through faith.",
    src: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36",
    alt: "Youth group members participating in activities",
    category: "youth"
  },
  {
    id: 4,
    type: "video",
    title: "Christmas Mass Highlights",
    description: "Highlights from our beautiful Christmas Mass celebration.",
    src: "https://www.youtube.com/shorts/LIyGx62OawM", // Placeholder YouTube embed
    alt: "Christmas Mass celebration video",
    category: "liturgical"
  },
  {
    id: 5,
    type: "image",
    title: "Baptism Ceremony",
    description: "A joyful baptism ceremony welcoming new members to our faith community.",
    src: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36",
    alt: "Baptism ceremony with family and priest",
    category: "sacrament"
  },
  {
    id: 6,
    type: "video",
    title: "Choir Performance",
    description: "Our talented choir performing beautiful hymns and spiritual music.",
    src: "https://www.youtube.com/shorts/LIyGx62OawM", // Placeholder YouTube embed
    alt: "Choir performance video",
    category: "music"
  },
  {
    id: 7,
    type: "image",
    title: "Parish Picnic",
    description: "Annual parish picnic bringing families together in fellowship.",
    src: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36",
    alt: "Families enjoying parish picnic activities",
    category: "community"
  },
  {
    id: 8,
    type: "image",
    title: "Confirmation Ceremony",
    description: "Young people receiving the sacrament of confirmation.",
    src: "https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/475925097_3233249990155896_2609915621922325122_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHs4e6S97TLHHu3_KsYYpXLydM6fSGKwqXJ0zp9IYrCpSZ-0uCDk7j1sbGdCp7cTY5yUrQSZTon565I5hSH82Mc&_nc_ohc=4oaoaV8zGkwQ7kNvwFhqgLi&_nc_oc=AdlptfAIJThaEZDK29Ah4zRojvPQxuZ_kp6UnS5rBFRNZPJrSufg5PKGMlVtemzZTaE&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=py2D-fEUBNUSP5Ni83CaXA&oh=00_Afi5Zo1X-TvWGXUxyrQ_BIMGFK269qiXLSsqsa2lrHIldg&oe=69155F36",
    alt: "Confirmation ceremony with bishop and candidates",
    category: "sacrament"
  }
];

const Gallery = () => {
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Open lightbox with selected item
  const openLightbox = (item: typeof galleryItems[0], index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // Navigate to previous/next item in lightbox
  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % galleryItems.length
      : (currentIndex - 1 + galleryItems.length) % galleryItems.length;

    setCurrentIndex(newIndex);
    setSelectedItem(galleryItems[newIndex]);
  };

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen) return;

    if (e.key === 'ArrowLeft') {
      navigateLightbox('prev');
    } else if (e.key === 'ArrowRight') {
      navigateLightbox('next');
    } else if (e.key === 'Escape') {
      setLightboxOpen(false);
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, currentIndex]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-dark text-church-pearl">
        <div className="absolute inset-0 pattern-geometric" />
        <div className="container mx-auto px-4 relative">
          <h1 className="text-5xl font-heading font-bold mb-4 text-center">
            Our Gallery
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-church-pearl/90">
            A glimpse into the life and ministry of our church through photos and memories.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground mb-8 text-center">
            Explore our gallery to see moments captured from our services, events, and community activities.
          </p>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map((item, index) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => openLightbox(item, index)}
              >
                <div className="relative">
                  {item.type === 'image' ? (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-church-gold/20 to-church-gold/40 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-2 text-church-gold" />
                        <p className="text-sm font-medium text-church-charcoal">Video</p>
                      </div>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white" />
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-church-gold/90 text-church-charcoal text-xs font-medium rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-heading font-bold mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateLightbox('prev')}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={() => navigateLightbox('next')}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Media content */}
            <div className="w-full h-full flex items-center justify-center p-8">
              {selectedItem && (
                <div className="max-w-full max-h-full">
                  {selectedItem.type === 'image' ? (
                    <img
                      src={selectedItem.src}
                      alt={selectedItem.alt}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={selectedItem.src}
                      title={selectedItem.title}
                      className="w-full h-full min-h-[400px] rounded-lg"
                      allowFullScreen
                    />
                  )}
                </div>
              )}
            </div>

            {/* Item info */}
            {selectedItem && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-6">
                <h3 className="text-xl font-bold mb-2">{selectedItem.title}</h3>
                <p className="text-gray-300">{selectedItem.description}</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-church-gold/90 text-church-charcoal text-xs font-medium rounded-full capitalize">
                    {selectedItem.category}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-church">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4">
            Want to See More?
          </h2>
          <p className="text-lg text-church-charcoal/80 mb-8 max-w-2xl mx-auto">
            Visit our church to experience the warmth and fellowship of our community in person.
          </p>
          <Link to="/visit">
            <Button variant="church" size="lg" className="group">
              Plan Your Visit
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Gallery;