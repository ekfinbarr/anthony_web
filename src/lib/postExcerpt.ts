import type { Post } from "@/services/post.service";

/** Plain-text summary of a post: its summary, or the start of its content with HTML stripped. */
export const postExcerpt = (post: Pick<Post, "summary" | "content">, length = 180): string => {
    const text = post.summary?.trim() || new DOMParser().parseFromString(post.content || "", "text/html").body.textContent?.trim() || "";
    const normalized = text.replace(/\s+/g, " ");
    return normalized.length > length ? `${normalized.slice(0, length).trimEnd()}…` : normalized;
};
