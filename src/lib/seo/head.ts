/**
 * Applies computed head tags to the live document.
 *
 * The build step writes route-specific tags into each prerendered HTML file;
 * on client-side navigation these helpers update those same tags in place
 * (matched by name/property/rel), so tags are never duplicated.
 */
import type { HeadTag } from "./meta";

function applyMeta(attr: "name" | "property", key: string, content: string | undefined): void {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    existing?.remove();
    return;
  }
  const element = existing ?? document.createElement("meta");
  if (!existing) {
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  if (element.getAttribute("content") !== content) element.setAttribute("content", content);
}

function applyLink(rel: string, href: string | undefined): void {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    existing?.remove();
    return;
  }
  const element = existing ?? document.createElement("link");
  if (!existing) {
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  if (element.getAttribute("href") !== href) element.setAttribute("href", href);
}

export function applyHeadTags(tags: HeadTag[]): void {
  for (const tag of tags) {
    if (tag.kind === "title") {
      if (document.title !== tag.content) document.title = tag.content;
    } else if (tag.kind === "meta") {
      applyMeta(tag.attr, tag.key, tag.content);
    } else {
      applyLink(tag.rel, tag.href);
    }
  }
}
