/**
 * Admin Bookshop Product View Page
 *
 * Provides a dedicated details view for a single bookshop product.
 * This makes the AdminShop "View" action functional:
 * - /admin/shop/:slug
 *
 * UX goals:
 * - Beautiful, readable layout
 * - Quick actions (edit, delete, toggle active/featured)
 * - Product image preview + replace image (AttachmentUploadModal)
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Image as ImageIcon, Loader2, Star, ToggleLeft, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import { useToast } from "@/hooks/use-toast";

import adminBookshopService, { BookshopProductAdmin } from "@/services/adminBookshop.service";

function formatAmount(amount?: string | number | null, currency: string = "NGN") {
  const n = amount === null || amount === undefined ? null : typeof amount === "string" ? Number(amount) : amount;
  if (n === null || !Number.isFinite(n) || n <= 0) return "Contact";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(n);
}

export default function ShopProductViewPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = slug ?? "";

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const productQuery = useQuery<{ data: BookshopProductAdmin }>({
    queryKey: ["admin-bookshop-product", safeSlug],
    queryFn: () => adminBookshopService.getProduct(safeSlug),
    enabled: !!safeSlug,
  });

  const product = productQuery.data?.data ?? null;
  const priceLabel = useMemo(() => formatAmount(product?.price ?? null, product?.currency || "NGN"), [product?.price, product?.currency]);

  const toggleMutation = useMutation({
    mutationFn: async (patch: Partial<Pick<BookshopProductAdmin, "is_active" | "is_featured">>) => {
      if (!safeSlug) throw new Error("Missing product slug");
      return adminBookshopService.updateProduct(safeSlug, patch);
    },
    onSuccess: async () => {
      toast({ title: "Updated", description: "Product updated successfully." });
      await qc.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
      await qc.invalidateQueries({ queryKey: ["admin-bookshop-product", safeSlug] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to update product";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!safeSlug) throw new Error("Missing product slug");
      return adminBookshopService.deleteProduct(safeSlug);
    },
    onSuccess: async () => {
      toast({ title: "Deleted", description: "Product deleted successfully." });
      await qc.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
      navigate("/admin/shop");
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to delete product";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  if (productQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (productQuery.error || !product) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">Product not found or failed to load.</p>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/admin/shop">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link to="/admin/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookshop
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-church-charcoal">{product.title}</h1>
            {product.is_active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
            {product.is_featured ? <Badge>Featured</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {product.category?.name ? <>Category: <span className="font-medium text-foreground">{product.category.name}</span></> : "No category"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/shop/${product.slug}/edit`}>
              <Edit className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.image_url ? (
                <div className="overflow-hidden rounded-xl border bg-muted/30">
                  <img src={product.image_url} alt={product.title} className="h-72 w-full object-cover" />
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/30 p-8 text-center">
                  <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No product image yet.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4" />
                  {product.image_url ? "Replace image" : "Upload image"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.description ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No short description.</p>
              )}

              {product.full_description ? (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium mb-2">Full description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{product.full_description}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{priceLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{product.currency || "NGN"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stock</span>
                <span className="font-medium">{product.stock_quantity ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sort order</span>
                <span className="font-medium">{product.sort_order ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    Active
                  </p>
                  <p className="text-xs text-muted-foreground">Show this product publicly.</p>
                </div>
                <Switch
                  checked={Boolean(product.is_active)}
                  onCheckedChange={(v) => toggleMutation.mutate({ is_active: v })}
                  disabled={toggleMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    Featured
                  </p>
                  <p className="text-xs text-muted-foreground">Highlight on the Bookshop page.</p>
                </div>
                <Switch
                  checked={Boolean(product.is_featured)}
                  onCheckedChange={(v) => toggleMutation.mutate({ is_featured: v })}
                  disabled={toggleMutation.isPending}
                />
              </div>

              {toggleMutation.isPending ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {product.variants && product.variants.length ? (
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Badge key={v} variant="secondary">
                      {v}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No variants.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload/Replace image */}
      <AttachmentUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        title="Upload product image"
        description="Upload a product image. After upload, it will be saved as the product image URL."
        relatedType="bookshop_product"
        relatedId={product.id}
        kinds={["image"]}
        allowUrlPaste={true}
        onUploaded={async (url) => {
          await adminBookshopService.updateProduct(product.slug, { image_url: url });
          await qc.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
          await qc.invalidateQueries({ queryKey: ["admin-bookshop-product", product.slug] });
          toast({ title: "Updated", description: "Product image updated." });
        }}
      />

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Product"
        description="This action cannot be undone. This will permanently delete the product."
        itemName={product.title}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}


