import { format, parseISO, isValid } from "date-fns";
import type { GalleryAlbum, GalleryAlbumItem, GalleryMediaKind } from "@/services/galleryAlbum.service";

export function albumDateLabel(album: Pick<GalleryAlbum, "event_date" | "event_end_date">): string | null {
  if (!album.event_date) return null;
  const start = parseISO(album.event_date);
  if (!isValid(start)) return null;

  if (album.event_end_date) {
    const end = parseISO(album.event_end_date);
    if (isValid(end) && album.event_end_date !== album.event_date) {
      if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
        return `${format(start, "MMM d")}–${format(end, "d, yyyy")}`;
      }
      if (start.getFullYear() === end.getFullYear()) {
        return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
      }
      return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
    }
  }

  return format(start, "MMMM d, yyyy");
}

export function albumCoverSrc(album: Pick<GalleryAlbum, "cover_url" | "items">): string | null {
  if (album.cover_url) return album.cover_url;
  const still = album.items?.find((item) => mediaKind(item) === "photo" && item.media_url);
  return still?.media_url ?? null;
}

export function mediaKind(item: Pick<GalleryAlbumItem, "media_kind" | "filetype">): GalleryMediaKind {
  if (item.media_kind) return item.media_kind;
  const ft = item.filetype ?? "";
  if (ft.startsWith("image/")) return "photo";
  if (ft.startsWith("video/")) return "video";
  if (ft.startsWith("audio/")) return "audio";
  return "other";
}

export function mediaAlt(item: Pick<GalleryAlbumItem, "alt_text" | "title">): string {
  return (item.alt_text?.trim() || item.title || "Gallery image").trim();
}

export function primaryAlbumCategory(album: GalleryAlbum): { id: string; label: string; slug: string } | null {
  return album.categories?.[0] ?? null;
}

export function formatMediaCounts(photoCount?: number, videoCount?: number, itemsCount?: number): string {
  const photos = photoCount ?? 0;
  const videos = videoCount ?? 0;
  const parts: string[] = [];
  if (photos > 0) parts.push(`${photos} photo${photos === 1 ? "" : "s"}`);
  if (videos > 0) parts.push(`${videos} video${videos === 1 ? "" : "s"}`);
  if (parts.length) return parts.join(" · ");
  const total = itemsCount ?? 0;
  if (total > 0) return `${total} item${total === 1 ? "" : "s"}`;
  return "No media yet";
}
