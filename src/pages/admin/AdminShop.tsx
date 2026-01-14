/**
 * Admin Bookshop Management Page
 * 
 * Comprehensive admin dashboard for managing bookshop inventory with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Product details view
 * - Delete with confirmation
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  ShoppingBag,
  Package,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import adminBookshopService, { BookshopProductAdmin } from "@/services/adminBookshop.service";

// Note: These interfaces should match your backend API
interface Product {
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "published" | "draft";
  featured: boolean;
  show_price: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  items_count: number;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  date: string;
}

const AdminShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  /**
   * Products (admin)
   *
   * We fetch products from the backend and normalize them into the table UI model.
   */
  const productsQuery = useQuery({
    queryKey: ["admin-bookshop-products"],
    queryFn: () => adminBookshopService.listProducts({ per_page: 100 }),
  });

  const products: Product[] = useMemo(() => {
    const list = (productsQuery.data?.data || []) as BookshopProductAdmin[];

    return list.map((p) => {
      const priceNumber =
        p.price === null || p.price === undefined
          ? 0
          : typeof p.price === "string"
            ? Number(p.price)
            : p.price;

      return {
        slug: p.slug,
        name: p.title,
        category: p.category?.name || "—",
        price: Number.isFinite(priceNumber) ? priceNumber : 0,
        stock: p.stock_quantity ?? 0,
        status: p.is_active ? "published" : "draft",
        featured: Boolean(p.is_featured),
        show_price: Boolean(p.price && Number(priceNumber) > 0),
      };
    });
  }, [productsQuery.data]);

  // Orders (not wired yet; kept as placeholder)
  const orders: Order[] = [];

  const handleCreate = () => {
    navigate("/admin/shop/new");
  };

  const handleEdit = (product: Product) => {
    navigate(`/admin/shop/${product.slug}/edit`);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => adminBookshopService.deleteProduct(slug),
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete product";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Bookshop Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage liturgical items, books, and gift shop inventory.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="devotional">Devotional Items</SelectItem>
                    <SelectItem value="liturgical">Liturgical Items</SelectItem>
                    <SelectItem value="statues">Statues</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productsQuery.isLoading ? (
                <div className="py-10">
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : products.length === 0 ? (
                <GenericEmptyState
                  title="No products found"
                  description="Get started by adding your first product"
                  actionLabel="Add Product"
                  onAction={handleCreate}
                  icon="shopping"
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products
                        .filter((p) => {
                          const matchesSearch =
                            !searchQuery ||
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesStatus =
                            statusFilter === "all" || p.status === statusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((product) => (
                        <TableRow key={product.slug} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {product.show_price ? formatAmount(product.price) : "Contact"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {product.stock}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={product.status === "published" ? "active" : "inactive"}
                              customLabel={product.status}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/shop/${product.slug}`}>
                                    <Eye className="mr-2 h-4 w-4" />View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(product)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <GenericEmptyState
                  title="No orders found"
                  description="Orders will appear here"
                  icon="shopping"
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{order.customer_name}</TableCell>
                          <TableCell>{order.items_count}</TableCell>
                          <TableCell>{formatAmount(order.total)}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={
                                order.status === "completed" ? "active" :
                                order.status === "cancelled" ? "cancelled" : "pending"
                              }
                              customLabel={order.status}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Product"
        description="This action cannot be undone. This will permanently delete the product."
        itemName={selectedProduct?.name}
        onConfirm={() => selectedProduct && deleteMutation.mutate(selectedProduct.slug)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminShop;
