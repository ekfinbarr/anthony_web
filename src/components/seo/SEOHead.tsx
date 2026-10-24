import { useEffect } from "react";
import { site } from "@/config/site";
import { applyHeadTags } from "@/lib/seo/head";
import { computeHeadTags, type PageMeta } from "@/lib/seo/meta";

export interface SEOHeadProps extends PageMeta {
  /** Canonical path, e.g. "/news/harvest-2026". Query strings and hashes are stripped. */
  path: string;
}

/**
 * Sets title, description, canonical, robots, Open Graph and Twitter tags for the current page.
 * Renders nothing; tags are written to <head>.
 */
const SEOHead = ({
  title,
  absoluteTitle,
  description,
  path,
  noindex = false,
  type = "website",
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  publishedTime,
  modifiedTime,
}: SEOHeadProps) => {
  useEffect(() => {
    applyHeadTags(
      computeHeadTags(site, {
        title,
        absoluteTitle,
        description,
        path,
        noindex,
        type,
        image,
        imageAlt,
        imageWidth,
        imageHeight,
        publishedTime,
        modifiedTime,
      }),
    );
  }, [
    title,
    absoluteTitle,
    description,
    path,
    noindex,
    type,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    publishedTime,
    modifiedTime,
  ]);

  return null;
};

export default SEOHead;
