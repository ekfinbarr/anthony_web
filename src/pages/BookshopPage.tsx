import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import BookshopCategoryTabs from '@/components/bookshop/BookshopCategoryTabs';
import BookshopGrid from '@/components/bookshop/BookshopGrid';
import BookshopProductModal from '@/components/bookshop/BookshopProductModal';
import bookshopData from '@/data/bookshop.json';
import bookshopService, { BookshopCategory as ApiCategory, BookshopProduct as ApiProduct } from '@/services/bookshop.service';
import { useToast } from '@/hooks/use-toast';

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

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function BookshopPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fallbackCatalog, setFallbackCatalog] = useState<Record<string, Product[]>>({});
  const [source, setSource] = useState<'api' | 'json'>('api');
  const [loading, setLoading] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>('bibles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  const mapApiCategory = (c: ApiCategory): Category => ({
    id: c.slug,
    name: c.name,
    icon: c.icon || '🛍️',
  });

  const mapApiProduct = (p: ApiProduct): Product => {
    const priceNumber =
      p.price === null || p.price === undefined
        ? 0
        : typeof p.price === 'string'
          ? Number(p.price)
          : p.price;

    const stock = p.stock_quantity;
    const availability = stock === 0 ? 'Out of Stock' : 'In Stock';

    return {
      id: p.id,
      title: p.title,
      description: p.description || '',
      price: Number.isFinite(priceNumber) ? priceNumber : 0,
      currency: p.currency || 'NGN',
      image: p.image_url || '/placeholder.svg',
      availability,
      variants: p.variants || undefined,
      fullDescription: p.full_description || undefined,
    };
  };

  const mapJsonToCatalog = () => {
    const catList: Category[] = [];
    const catalog: Record<string, Product[]> = {};

    type JsonProduct = {
      id: number;
      title: string;
      description: string;
      price: number;
      image?: string;
      availability?: string;
      variants?: string[];
      fullDescription?: string;
    };
    type JsonCategory = { id: string; name: string; icon: string; products: JsonProduct[] };
    const json = bookshopData as unknown as { categories: JsonCategory[] };

    for (const cat of json.categories) {
      catList.push({ id: cat.id, name: cat.name, icon: cat.icon });

      catalog[cat.id] = cat.products.map((p) => ({
        id: String(p.id),
        title: p.title,
        description: p.description,
        price: Number(p.price) || 0,
        currency: 'USD',
        image: p.image || '/placeholder.svg',
        availability: p.availability || 'In Stock',
        variants: p.variants,
        fullDescription: p.fullDescription,
      }));
    }

    setCategories(catList);
    setFallbackCatalog(catalog);
    setSource('json');
  };

  // Initial load: try API categories; if it fails, use local JSON.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const res = await bookshopService.listCategories();
        const apiCats = res.data || [];
        if (apiCats.length === 0) {
          mapJsonToCatalog();
          return;
        }

        const mapped = apiCats.map(mapApiCategory);
        setCategories(mapped);
        setSource('api');

        // Keep current activeCategory if it exists; otherwise use the first category.
        const exists = mapped.some((c) => c.id === activeCategory);
        if (!exists && mapped[0]) {
          setActiveCategory(mapped[0].id);
        }
      } catch (e: unknown) {
        mapJsonToCatalog();
        toast({
          title: 'Bookshop (offline mode)',
          description: 'Could not load bookshop items from the server. Showing local catalog.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // For API mode: fetch products for current category/search.
  useEffect(() => {
    if (source !== 'api') return;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await bookshopService.listProducts({
          category_slug: activeCategory,
          search: searchTerm || undefined,
        });
        setApiProducts((res.data || []).map(mapApiProduct));
      } catch (e: unknown) {
        // If products endpoint fails, drop to JSON fallback.
        mapJsonToCatalog();
        toast({
          title: 'Bookshop (offline mode)',
          description: 'Could not load products from the server. Showing local catalog.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, activeCategory, searchTerm]);

  const activeProducts = useMemo(() => {
    if (source === 'api') return apiProducts;

    const products = fallbackCatalog[activeCategory] || [];
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }, [source, apiProducts, fallbackCatalog, activeCategory, searchTerm]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

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
              {loading
                ? 'Loading products...'
                : searchTerm
                  ? 'No products found matching your search.'
                  : 'No products available in this category.'}
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