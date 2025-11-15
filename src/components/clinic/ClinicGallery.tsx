import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Facility {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface ClinicGalleryProps {
  facilities: Facility[];
}

export default function ClinicGallery({ facilities }: ClinicGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Facility | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (facility: Facility, index: number) => {
    setSelectedImage(facility);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % facilities.length);
    setSelectedImage(facilities[(currentIndex + 1) % facilities.length]);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + facilities.length) % facilities.length);
    setSelectedImage(facilities[(currentIndex - 1 + facilities.length) % facilities.length]);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">Our Facilities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take a look at our modern clinic facilities designed to provide
            comfortable and professional healthcare services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => (
            <Card
              key={facility.id}
              className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => openModal(facility, index)}
            >
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-primary group-hover:text-blue-700 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {facility.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal for full-size image viewing */}
        <Dialog open={!!selectedImage} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="text-xl font-bold text-primary">
                {selectedImage?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="relative">
              <div className="aspect-video bg-gray-100">
                <img
                  src={selectedImage?.image}
                  alt={selectedImage?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Navigation buttons */}
              {facilities.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Close button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <p className="text-muted-foreground">
                {selectedImage?.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}