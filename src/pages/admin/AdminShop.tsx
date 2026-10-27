/**
 * Admin Bookshop Management Page
 *
 * Internal catalog tooling (API-backed). The public /bookshop page is
 * informational only and does not list products or prices from this admin.
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Package,
  XCircle,
  Upload,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { CsvImportDialog } from "@/components/admin/shared/CsvImportDialog";
import adminBookshopService, {
  BookshopProductAdmin,
  BookshopOrderAdmin,
} from "@/services/adminBookshop.service";

import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import type { ExportColumn } from "@/lib/export/tableExport";
import { InsightsPanel } from "@/components/admin/data/InsightsPanel";
interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "published" | "draft";
  featured: boolean;
  show_price: boolean;
}

const AdminShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const orderSelection = useBulkSelection<BookshopOrderAdmin>(rowId);
  const productSelection = useBulkSelection<Product>(rowId);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<BookshopOrderAdmin | null>(null);
  const [orderAction, setOrderAction] = useState<"confirm" | "ready" | "complete" | "cancel" | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);

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
        id: String(p.id),
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

  const ordersQuery = useQuery({
    queryKey: ["admin-bookshop-orders", orderStatusFilter],
    queryFn: () =>
      adminBookshopService.listOrders({
        per_page: 50,
        status: orderStatusFilter === "all" ? undefined : orderStatusFilter,
      }),
    enabled: activeTab === "orders",
  });

  const orders = (ordersQuery.data?.data || []) as BookshopOrderAdmin[];

  const orderActionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder || !orderAction) throw new Error("No order selected");
      const notes = orderNotes.trim() || undefined;
      if (orderAction === "confirm") return adminBookshopService.confirmOrder(selectedOrder.id, { admin_notes: notes });
      if (orderAction === "ready") return adminBookshopService.readyOrder(selectedOrder.id, { admin_notes: notes });
      if (orderAction === "complete") return adminBookshopService.completeOrder(selectedOrder.id, { admin_notes: notes });
      if (!cancelReason.trim()) throw new Error("Cancellation reason is required");
      return adminBookshopService.cancelOrder(selectedOrder.id, {
        admin_notes: notes,
        cancelled_reason: cancelReason.trim(),
      });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Order status updated." });
      queryClient.invalidateQueries({ queryKey: ["admin-bookshop-orders"] });
      setOrderAction(null);
      setSelectedOrder(null);
      setOrderNotes("");
      setCancelReason("");
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order",
        variant: "destructive",
      });
    },
  });

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

  const productColumns: ExportColumn<Product>[] = [
    { header: "Product", value: (p) => p.name, width: 32 },
    { header: "Category", value: (p) => p.category },
    { header: "Price", value: (p) => p.price, type: "money" },
    { header: "Stock", value: (p) => p.stock, type: "number", total: true },
    { header: "Status", value: (p) => p.status },
    { header: "Featured", value: (p) => p.featured },
  ];
  const fetchAllProducts = () => fetchAllPages<Product>((page, per_page) => Promise.resolve(products) as never);

  const orderColumns: ExportColumn<BookshopOrderAdmin>[] = [
    { header: "Reference", value: (o) => o.reference },
    { header: "Customer", value: (o) => o.customer_name },
    { header: "Email", value: (o) => o.customer_email ?? "" },
    { header: "Phone", value: (o) => o.customer_phone ?? "" },
    { header: "Items", value: (o) => (o.items ?? []).map((i) => `${i.quantity}× ${i.product_title}`).join("; "), width: 40 },
    { header: "Status", value: (o) => o.status },
    { header: "Total", value: (o) => Number(o.total_amount), type: "money", total: true },
  ];
  const fetchAllOrders = () => fetchAllPages<BookshopOrderAdmin>((page, per_page) => adminBookshopService.listOrders({ page, per_page, status: orderStatusFilter === "all" ? undefined : orderStatusFilter }) as never);

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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ExportMenu title="Bookshop products" filename="bookshop-products" columns={productColumns} fetchAll={fetchAllProducts} selected={productSelection.rows} currency="NGN" />
          </div>
      <BulkActionBar resource="bookshop_products" selection={productSelection} describe={(product) => product.name} noun={["product", "products"]} onComplete={() => queryClient.invalidateQueries({ queryKey: ["admin-bookshop-products"] })}>
        <ExportMenu variant="bar" title="Bookshop products" filename="bookshop-products" columns={productColumns} fetchAll={fetchAllProducts} selected={productSelection.rows} currency="NGN" />
      </BulkActionBar>
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
                      <TableHead className="w-10"><SelectAllCheckbox selection={productSelection} rows={products} /></TableHead>
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
                        <TableRow key={product.slug} className="hover:bg-muted/50" data-state={productSelection.isSelected(product) ? "selected" : undefined}>
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}><SelectRowCheckbox selection={productSelection} row={product} label={`Select ${product.name}`} /></TableCell>
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
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ExportMenu title="Bookshop orders" filename="bookshop-orders" columns={orderColumns} fetchAll={fetchAllOrders} selected={orderSelection.rows} currency="NGN" />
          </div>
          <InsightsPanel module="bookshop_orders" />
      <BulkActionBar resource="bookshop_orders" selection={orderSelection} describe={(order) => `${order.reference} · ${order.customer_name}`} noun={["order", "orders"]} onComplete={() => queryClient.invalidateQueries({ queryKey: ["admin-bookshop-orders"] })}>
        <ExportMenu variant="bar" title="Bookshop orders" filename="bookshop-orders" columns={orderColumns} fetchAll={fetchAllOrders} selected={orderSelection.rows} currency="NGN" />
      </BulkActionBar>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Orders</CardTitle>
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="ready_for_pickup">Ready for pickup</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {ordersQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <GenericEmptyState
                  title="No orders found"
                  description="Orders will appear here when customers submit requests."
                  icon="shopping"
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead className="w-10"><SelectAllCheckbox selection={orderSelection} rows={orders} /></TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const total = Number(order.total_amount || 0);
                        const itemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0)
                          ?? order.items?.length
                          ?? 0;
                        return (
                          <TableRow key={order.id} className="hover:bg-muted/50" data-state={orderSelection.isSelected(order) ? "selected" : undefined}>
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}><SelectRowCheckbox selection={orderSelection} row={order} label={`Select ${`${order.reference} · ${order.customer_name}`}`} /></TableCell>
                            <TableCell className="font-mono text-xs">{order.reference || order.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-xs text-muted-foreground">{order.customer_email || "—"}</div>
                            </TableCell>
                            <TableCell>{itemsCount}</TableCell>
                            <TableCell>{formatAmount(Number.isFinite(total) ? total : 0)}</TableCell>
                            <TableCell>
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={
                                  order.status === "completed"
                                    ? "active"
                                    : order.status === "cancelled"
                                      ? "cancelled"
                                      : "pending"
                                }
                                customLabel={order.status.replaceAll("_", " ")}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {order.status === "pending" ? (
                                    <DropdownMenuItem onClick={() => { setSelectedOrder(order); setOrderAction("confirm"); }}>
                                      <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                                    </DropdownMenuItem>
                                  ) : null}
                                  {order.status === "confirmed" ? (
                                    <DropdownMenuItem onClick={() => { setSelectedOrder(order); setOrderAction("ready"); }}>
                                      <Package className="mr-2 h-4 w-4" /> Mark Ready
                                    </DropdownMenuItem>
                                  ) : null}
                                  {order.status === "ready_for_pickup" ? (
                                    <DropdownMenuItem onClick={() => { setSelectedOrder(order); setOrderAction("complete"); }}>
                                      <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                                    </DropdownMenuItem>
                                  ) : null}
                                  {order.status !== "completed" && order.status !== "cancelled" ? (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => { setSelectedOrder(order); setOrderAction("cancel"); setCancelReason(""); }}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

      {/* Order details */}
      <Dialog
        open={!!selectedOrder && !orderAction}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.reference || ""}</DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Customer:</span> {selectedOrder.customer_name}</div>
              <div><span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email || "—"}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone || "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> {selectedOrder.status.replaceAll("_", " ")}</div>
              <div>
                <span className="text-muted-foreground">Total:</span>{" "}
                {formatAmount(Number(selectedOrder.total_amount || 0))}
              </div>
              {selectedOrder.items?.length ? (
                <div className="rounded-md border divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2">
                      <span>
                        {item.product_title || "Item"} × {item.quantity}
                        {item.variant ? ` (${item.variant})` : ""}
                      </span>
                      <span>{formatAmount(Number(item.unit_price || 0) * (item.quantity || 0))}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <CsvImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import products"
        description="Upload a CSV of bookshop products. Categories must already exist."
        sampleHeaders="title,category_slug,price,stock,currency,description"
        isLoading={importing}
        onImport={async (file) => {
          setImporting(true);
          try {
            const res = await adminBookshopService.importProducts(file);
            queryClient.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
            toast({
              title: "Import finished",
              description: `${res.data.imported} imported, ${res.data.failed} failed`,
            });
            return res.data;
          } finally {
            setImporting(false);
          }
        }}
      />

      {/* Order status action */}
      <Dialog
        open={!!orderAction}
        onOpenChange={(open) => {
          if (!open) {
            setOrderAction(null);
            setOrderNotes("");
            setCancelReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {orderAction === "confirm" && "Confirm order"}
              {orderAction === "ready" && "Mark ready for pickup"}
              {orderAction === "complete" && "Complete order"}
              {orderAction === "cancel" && "Cancel order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="order-notes">Admin notes</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                placeholder="Optional notes..."
              />
            </div>
            {orderAction === "cancel" ? (
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">
                  Cancellation reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Why is this order being cancelled?"
                  required
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderAction(null)} disabled={orderActionMutation.isPending}>
              Back
            </Button>
            <Button
              variant={orderAction === "cancel" ? "destructive" : "default"}
              onClick={() => orderActionMutation.mutate()}
              disabled={
                orderActionMutation.isPending ||
                (orderAction === "cancel" && !cancelReason.trim())
              }
            >
              {orderActionMutation.isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShop;
