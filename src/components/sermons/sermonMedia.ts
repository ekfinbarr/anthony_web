/**
 * Helpers for sermon thumbnails and video embeds (YouTube / Vimeo / direct).
 */

import { mediaUrl } from "@/components/parish-home/media";
import type { Sermon } from "@/services/sermon.service";

export type SermonMediaKind = "video" | "audio" | "notes" | "none";

export function sermonThumbnail(sermon: Pick<Sermon, "thumbnail_url" | "video_url">): string | undefined {
  if (sermon.thumbnail_url) return mediaUrl(sermon.thumbnail_url);
  const yt = extractYouTubeId(sermon.video_url);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  return undefined;
}

export function sermonMediaKinds(sermon: Pick<Sermon, "video_url" | "audio_url" | "notes_url" | "sermon_notes">): SermonMediaKind[] {
  const kinds: SermonMediaKind[] = [];
  if (sermon.video_url) kinds.push("video");
  if (sermon.audio_url) kinds.push("audio");
  if (sermon.notes_url || sermon.sermon_notes) kinds.push("notes");
  return kinds.length ? kinds : ["none"];
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
  } catch {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    return m?.[1] ?? null;
  }
  return null;
}

export function extractVimeoId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

/** Returns an iframe-ready embed URL, or null if the source should use a native <video>. */
export function getVideoEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const yt = extractYouTubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1`;
  const vimeo = extractVimeoId(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`;
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("/storage/")) return null;
  // Unknown host — try as-is only if it looks like an embed path
  if (url.includes("/embed")) return url;
  return null;
}

export function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return getVideoEmbedUrl(url) === null && Boolean(url);
}

export function formatSermonDate(date?: string | null): string {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}
