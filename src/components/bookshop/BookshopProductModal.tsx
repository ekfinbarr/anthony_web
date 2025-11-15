import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  availability: string;
  variants?: string[];
  fullDescription?: string;
}

interface BookshopProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookshopProductModal({
  product,
  isOpen,
  onClose,
}: BookshopProductModalProps) {
  if (!product) return null;

  const handleOrder = () => {
    // For now, show contact information
    alert(`To order "${product.title}", please contact the parish office at:\n\nPhone: (555) 123-4567\nEmail: office@stanthonychurch.org\n\nOr visit us at the parish office during business hours.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              <Badge
                variant={product.availability === 'In Stock' ? 'default' : 'secondary'}
                className={product.availability === 'In Stock' ? 'bg-green-100 text-green-800' : ''}
              >
                {product.availability}
              </Badge>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {product.fullDescription && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.fullDescription}
                  </p>
                </div>
              </>
            )}

            {product.variants && product.variants.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Available Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <Badge key={index} variant="outline">
                        {variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button onClick={handleOrder} className="w-full sm:w-auto">
            Order Now
          </Button>
        </DialogFooter>

        {/* Contact Information */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">How to Order</h4>
          <p className="text-sm text-muted-foreground mb-2">
            For ordering inquiries, please contact our parish office:
          </p>
          <div className="text-sm space-y-1">
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> office@stanthonychurch.org</p>
            <p><strong>Address:</strong> 123 Church Street, Gbaja, Nigeria</p>
            <p><strong>Hours:</strong> Monday-Friday 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}