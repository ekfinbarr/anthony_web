import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import BookshopCategoryTabs from '@/components/bookshop/BookshopCategoryTabs';
import BookshopGrid from '@/components/bookshop/BookshopGrid';
import BookshopProductModal from '@/components/bookshop/BookshopProductModal';
import bookshopData from '@/data/bookshop.json';

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

interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

export default function BookshopPage() {
  const [categories] = useState<Category[]>(bookshopData.categories);
  const [activeCategory, setActiveCategory] = useState<string>('bibles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all products from active category
  const getActiveProducts = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    if (!category) return [];

    return category.products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const activeProducts = getActiveProducts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Parish Bookshop
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our collection of Catholic books, sacramentals, and religious items.
              Browse by category or search for specific items.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <BookshopCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Products Grid */}
      <div className="container mx-auto">
        {activeProducts.length > 0 ? (
          <BookshopGrid
            products={activeProducts}
            onProductClick={handleProductClick}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? 'No products found matching your search.' : 'No products available in this category.'}
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <BookshopProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Footer Info */}
      <div className="bg-muted/50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-semibold mb-2">Need Help with Your Order?</h3>
          <p className="text-muted-foreground mb-4">
            Contact our parish bookshop for assistance with bookshop orders and inquiries.
          </p>
          <div className="text-sm text-muted-foreground">
            <p><strong>Phone:</strong> (234) 123 456 7899</p>
            <p><strong>Email:</strong> bookshop@stanthonygbaja.org</p>
            <p><strong>Visit:</strong> Parish bookshop during business hours (Weekdays 8am - 5pm)</p>
          </div>
        </div>
      </div>
    </div>
  );
}