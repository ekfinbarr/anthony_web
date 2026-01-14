/**
 * Shop Product Form Page
 *
 * Create/Edit bookshop products:
 * - /admin/shop/new
 * - /admin/shop/:slug/edit
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import adminBookshopService, { BookshopProductAdmin } from "@/services/adminBookshop.service";
import attachmentService, { Attachment } from "@/services/attachment.service";
import { ArrowLeft, Image as ImageIcon, Save, Upload, X } from "lucide-react";

export default function ShopProductFormPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { slug } = useParams<{ slug: string }>();
  const isEdit = Boolean(slug);

  const categoriesQuery = useQuery({
    queryKey: ["admin-bookshop-categories"],
    queryFn: () => adminBookshopService.listCategories({ per_page: 100 }),
  });

  const productQuery = useQuery({
    queryKey: ["admin-bookshop-product", slug],
    queryFn: () => adminBookshopService.getProduct(slug!),
    enabled: isEdit && !!slug,
  });

  const [form, setForm] = useState({
    category_id: "",
    title: "",
    description: "",
    full_description: "",
    price: "",
    currency: "NGN",
    image_url: "",
    variants: "",
    stock_quantity: "",
    is_active: true,
    is_featured: false,
    sort_order: "0",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Initialize form from product
  useEffect(() => {
    const t = setTimeout(() => {
      if (productQuery.data?.data) {
        const p = productQuery.data.data;
        setForm({
          category_id: p.category?.id || "",
          title: p.title || "",
          description: p.description || "",
          full_description: p.full_description || "",
          price: p.price === null || p.price === undefined ? "" : String(p.price),
          currency: p.currency || "NGN",
          image_url: p.image_url || "",
          variants: Array.isArray(p.variants) ? p.variants.join(", ") : "",
          stock_quantity: p.stock_quantity === null || p.stock_quantity === undefined ? "" : String(p.stock_quantity),
          is_active: Boolean(p.is_active),
          is_featured: Boolean(p.is_featured),
          sort_order: p.sort_order === undefined || p.sort_order === null ? "0" : String(p.sort_order),
        });
        setImagePreview(p.image_url || "");
        setImageFile(null);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [productQuery.data]);

  // Auto-select the first category for new products.
  useEffect(() => {
    if (isEdit) return;
    if (form.category_id) return;
    const first = categoriesQuery.data?.data?.[0];
    if (first) {
      // Avoid synchronous setState at the top-level of an effect (lint rule).
      const t = setTimeout(() => {
        setForm((prev) => ({ ...prev, category_id: first.id }));
      }, 0);
      return () => clearTimeout(t);
    }
  }, [categoriesQuery.data, form.category_id, isEdit]);

  const canSubmit = useMemo(() => Boolean(form.title.trim() && form.category_id), [form.title, form.category_id]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = (await adminBookshopService.createProduct({
        category_id: form.category_id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        full_description: form.full_description.trim() || undefined,
        price: form.price ? Number(form.price) : null,
        currency: form.currency || "NGN",
        image_url: form.image_url.trim() || undefined,
        variants: form.variants
          ? form.variants.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        sort_order: Number(form.sort_order || 0),
      })) as { message: string; data: BookshopProductAdmin };

      // Optional: upload image file after product exists.
      if (imageFile && created?.data?.id && created?.data?.slug) {
        const uploadRes: Attachment = await attachmentService.create({
          file: imageFile,
          related_type: "bookshop_product",
          related_id: String(created.data.id),
        });

        const attachmentId = uploadRes?.id;
        if (attachmentId) {
          const url = await attachmentService.getUrl(String(attachmentId), false);
          await adminBookshopService.updateProduct(created.data.slug, { image_url: url });
        }
      }

      return created;
    },
    onSuccess: () => {
      toast({ title: "Created", description: "Product created successfully." });
      qc.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
      navigate("/admin/shop");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to create product";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updated = (await adminBookshopService.updateProduct(slug!, {
        category_id: form.category_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        full_description: form.full_description.trim() || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency || "NGN",
        image_url: form.image_url.trim() || null,
        variants: form.variants
          ? form.variants.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        sort_order: Number(form.sort_order || 0),
      })) as { message: string; data: BookshopProductAdmin };

      // Optional image upload
      const productId = productQuery.data?.data?.id;
      if (imageFile && productId) {
        const uploadRes: Attachment = await attachmentService.create({
          file: imageFile,
          related_type: "bookshop_product",
          related_id: String(productId),
        });
        const attachmentId = uploadRes?.id;
        if (attachmentId) {
          const url = await attachmentService.getUrl(String(attachmentId), false);
          await adminBookshopService.updateProduct(slug!, { image_url: url });
        }
      }

      return updated;
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Product updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-bookshop-products"] });
      qc.invalidateQueries({ queryKey: ["admin-bookshop-product", slug] });
      navigate("/admin/shop");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update product";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          <p className="text-muted-foreground mt-1">Manage your parish bookshop catalog (no online payments/delivery).</p>
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/admin/shop">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm((p) => ({ ...p, category_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={categoriesQuery.isLoading ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data?.data || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Price (optional)</Label>
              <Input value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Stock quantity (optional)</Label>
              <Input value={form.stock_quantity} onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Sort order</Label>
              <Input value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Product Image</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={form.image_url}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, image_url: e.target.value }));
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }}
                      placeholder="Image URL (optional)"
                    />
                    <Button type="button" variant="outline" size="icon" aria-label="Upload image">
                      <Label className="cursor-pointer m-0 p-0" htmlFor="product-image-upload">
                        <Upload className="h-4 w-4" />
                      </Label>
                    </Button>
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;
                        setImageFile(file);
                        const url = URL.createObjectURL(file);
                        setImagePreview(url);
                        // Clear URL field so we don't accidentally overwrite with stale value
                        setForm((p) => ({ ...p, image_url: "" }));
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can paste an image URL or upload a file. Uploaded files are stored as attachments and linked to this product.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/20 overflow-hidden">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Product preview" className="w-full h-40 object-cover" />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setForm((p) => ({ ...p, image_url: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ImageIcon className="h-8 w-8" />
                      <div className="text-sm">No image selected</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Variants (comma-separated)</Label>
              <Input value={form.variants} onChange={(e) => setForm((p) => ({ ...p, variants: e.target.value }))} placeholder="Hardcover, Paperback" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Full description</Label>
              <Textarea value={form.full_description} onChange={(e) => setForm((p) => ({ ...p, full_description: e.target.value }))} rows={5} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
              <div>
                <div className="font-medium">Active</div>
                <div className="text-sm text-muted-foreground">Visible on the public bookshop page</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_featured} onCheckedChange={(v) => setForm((p) => ({ ...p, is_featured: v }))} />
              <div>
                <div className="font-medium">Featured</div>
                <div className="text-sm text-muted-foreground">Highlight on the store</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="gap-2"
              disabled={!canSubmit || isSubmitting}
              onClick={() => (isEdit ? updateMutation.mutate() : createMutation.mutate())}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


