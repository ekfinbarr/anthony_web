/**
 * Admin Gallery Page
 *
 * Combines:
 * - Albums manager (new)
 * - Media library (existing attachments-based manager)
 *
 * This keeps the sidebar link stable at `/admin/gallery` while adding Albums.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminGalleryAlbums from "@/pages/admin/AdminGalleryAlbums";

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-church-charcoal">Gallery</h1>
          <p className="text-sm text-muted-foreground">Manage albums (public) and your media library (attachments).</p>
        </div>
      </div>

      <Tabs defaultValue="albums">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
        </TabsList>
        <TabsContent value="albums">
          <AdminGalleryAlbums />
        </TabsContent>
        <TabsContent value="media">
          <AdminGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}


