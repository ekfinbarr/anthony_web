import type { Post } from "@/services/post.service";
import { postExcerpt } from "@/lib/postExcerpt";
import { mediaUrl } from "@/components/parish-home/media";
import bannerPhoto from "@/assets/images/st_anthony.webp";

const WORDS_PER_MINUTE = 200;

/** Prefer published_at, then created_at. */
export const postDate = (post: Pick<Post, "published_at" | "created_at">): string =>
  post.published_at || post.created_at;

export const readingMinutes = (post: Pick<Post, "content" | "summary">): number => {
  const source = post.content || post.summary || "";
  const text =
    typeof document !== "undefined"
      ? new DOMParser().parseFromString(source, "text/html").body.textContent || ""
      : source.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export const primaryCategory = (post: Post): { label: string; slug: string } | null => {
  const cat = post.categories?.[0];
  if (!cat) return null;
  return { label: cat.label, slug: cat.slug };
};

export const newsCoverSrc = (post: Pick<Post, "image" | "og_image"> | null | undefined): string => {
  const raw = post?.og_image || post?.image;
  return mediaUrl(raw) || bannerPhoto;
};

export const newsCoverAlt = (post: Pick<Post, "image_alt" | "title">): string =>
  post.image_alt?.trim() || post.title || "Parish news";

export { postExcerpt };
