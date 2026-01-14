import React, { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import bookshopService from '@/services/bookshop.service';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  availability: string;
  variants?: string[];
  fullDescription?: string;
  currency?: string;
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
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<string>("");
  const [notes, setNotes] = useState("");

  const currency = product?.currency || "NGN";
  const formattedPrice = useMemo(() => {
    if (!product) return "";
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(product.price);
    } catch {
      return `${currency} ${product.price.toFixed(2)}`;
    }
  }, [currency, product]);

  const handleReserveForPickup = async () => {
    try {
      setSubmitting(true);

      if (!customerName.trim() || !customerEmail.trim()) {
        toast({
          title: "Missing details",
          description: "Please provide your name and email so we can confirm your pickup.",
          variant: "destructive",
        });
        return;
      }

      await bookshopService.createOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        items: [
          {
            product_id: product.id,
            quantity,
            variant: variant.trim() || undefined,
          },
        ],
      });

      toast({
        title: "Order Request Submitted",
        description: "Thanks! We will contact you to confirm availability and pickup details.",
      });

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setQuantity(1);
      setVariant("");
      setNotes("");
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to submit order request. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

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
                {formattedPrice}
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

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">Reserve for Pickup</h4>
              <p className="text-sm text-muted-foreground">
                No online payment or delivery. Submit a request and we’ll contact you for pickup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="bs-name">Your Name *</Label>
                  <Input id="bs-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bs-email">Email *</Label>
                  <Input id="bs-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="bs-phone">Phone</Label>
                  <Input id="bs-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bs-qty">Quantity</Label>
                  <Input
                    id="bs-qty"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-1">
                  <Label htmlFor="bs-variant">Variant (optional)</Label>
                  <Input id="bs-variant" value={variant} onChange={(e) => setVariant(e.target.value)} placeholder={product.variants[0]} />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="bs-notes">Notes (optional)</Label>
                <Textarea id="bs-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button onClick={handleReserveForPickup} className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Submitting..." : "Reserve for Pickup"}
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