import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  availability: string;
  currency?: string;
}

interface BookshopGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function BookshopGrid({ products, onProductClick }: BookshopGridProps) {
  const formatPrice = (price: number, currency: string = "NGN") => {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(price);
    } catch {
      return `${currency} ${price.toFixed(2)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
          onClick={() => onProductClick(product)}
        >
          <CardContent className="p-4">
            <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </span>
              <Badge
                variant={product.availability === 'In Stock' ? 'default' : 'secondary'}
                className={product.availability === 'In Stock' ? 'bg-green-100 text-green-800' : ''}
              >
                {product.availability}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}>
              Order Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}