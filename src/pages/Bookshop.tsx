import { useState } from "react";
import { Search, Phone, MapPin, Clock, Book, Cross, Gift, Sparkles, ShoppingBag, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", name: "All Items", icon: ShoppingBag },
  { id: "bibles", name: "Bibles", icon: Book },
  { id: "spiritual", name: "Spiritual Books", icon: Sparkles },
  { id: "vessels", name: "Sacred Vessels", icon: Cross },
  { id: "vestments", name: "Vestments", icon: Heart },
  { id: "gifts", name: "Gift Items", icon: Gift },
  { id: "sacramentals", name: "Sacramentals", icon: Cross },
];

const products = [
  { id: 1, name: "Catholic Study Bible (RSV)", category: "bibles", price: 8500, image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=300", description: "Complete RSV Catholic Edition with study notes" },
  { id: 2, name: "Douay-Rheims Bible", category: "bibles", price: 6500, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300", description: "Traditional Catholic Bible translation" },
  { id: 3, name: "The Imitation of Christ", category: "spiritual", price: 2500, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300", description: "Classic spiritual devotional by Thomas à Kempis" },
  { id: 4, name: "Story of a Soul", category: "spiritual", price: 3000, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300", description: "Autobiography of St. Thérèse of Lisieux" },
  { id: 5, name: "Gold Plated Chalice", category: "vessels", price: 45000, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300", description: "Beautifully crafted gold plated communion chalice" },
  { id: 6, name: "Ciborium Set", category: "vessels", price: 35000, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300", description: "Silver plated ciborium with lid" },
  { id: 7, name: "Priest Chasuble - Green", category: "vestments", price: 28000, image: "https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?w=300", description: "Ordinary time green chasuble with gold trim" },
  { id: 8, name: "Altar Server Cassock", category: "vestments", price: 12000, image: "https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?w=300", description: "Black cassock for altar servers" },
  { id: 9, name: "Crystal Rosary", category: "gifts", price: 4500, image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300", description: "Beautiful crystal rosary beads with silver crucifix" },
  { id: 10, name: "St. Anthony Statue (12\")", category: "gifts", price: 8000, image: "https://images.unsplash.com/photo-1545987796-200677ee1011?w=300", description: "Hand-painted resin statue of St. Anthony" },
  { id: 11, name: "Holy Water Font", category: "sacramentals", price: 3500, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300", description: "Ceramic holy water font for home use" },
  { id: 12, name: "Blessed Candles (Pack of 6)", category: "sacramentals", price: 1500, image: "https://images.unsplash.com/photo-1603905179474-10b6bb024c8f?w=300", description: "Blessed candles for home devotions" },
];

const Bookshop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Request Submitted",
      description: "We'll get back to you shortly about your item request.",
    });
    setRequestDialogOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(price);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200"
            alt="Church Bookshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary/60" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-in">
            Parish <span className="text-primary">Bookshop</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto px-4 opacity-90">
            Sacred items, spiritual books, and religious articles for your faith journey
          </p>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">7am – 5pm (Daily, except Saturdays)</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span className="text-sm font-medium">+234 802 345 6789</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Church Premises, Gbaja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Can't find an item? Request More
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request an Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input id="item-name" placeholder="What are you looking for?" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Provide more details..." />
                  </div>
                  <div>
                    <Label htmlFor="contact">Your Phone Number</Label>
                    <Input id="contact" type="tel" placeholder="+234..." required />
                  </div>
                  <Button type="submit" className="w-full">Submit Request</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter</p>
              <Button onClick={() => setRequestDialogOpen(true)}>Request This Item</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xs:grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <Card key={product.id} className="group overflow-hidden card-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {categories.find(c => c.id === product.category)?.name}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button className="flex-1 gap-2" variant="church">
                      <Phone className="h-4 w-4" />
                      Call to Order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Need Help Finding Something?</h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            Our bookshop staff are happy to assist you. Visit us at the parish or give us a call.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="church" asChild>
              <a href="tel:+2348023456789" className="gap-2">
                <Phone className="h-5 w-5" />
                Call Now: +234 802 345 6789
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <MapPin className="h-5 w-5 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bookshop;