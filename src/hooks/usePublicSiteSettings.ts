import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import siteSettingService, { type PublicSiteSettingsGrouped } from "@/services/siteSetting.service";
import { formatAddress, site } from "@/config/site";

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export type PublicContactInfo = {
  address: string;
  phone?: string;
  email: string;
  emergency?: string;
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
};

function resolveContact(settings: PublicSiteSettingsGrouped | undefined): PublicContactInfo {
  const contact = settings?.contact ?? {};
  const social = settings?.social ?? {};

  return {
    address: asString(contact.contact_address) ?? formatAddress(site.address),
    phone: asString(contact.contact_phone) ?? site.telephone,
    email: asString(contact.contact_email) ?? site.email,
    emergency: asString(contact.emergency_contact),
    social: {
      facebook: asString(social.facebook_url) ?? asString(site.social.facebook),
      twitter: asString(social.twitter_url) ?? asString(site.social.twitter),
      instagram: asString(social.instagram_url) ?? asString(site.social.instagram),
      youtube: asString(social.youtube_url) ?? asString(site.social.youtube),
      whatsapp: asString(site.social.whatsapp),
    },
  };
}

/** Normalize empty social strings so consumers can skip blank links. */
function cleanSocial(info: PublicContactInfo): PublicContactInfo {
  const social = Object.fromEntries(
    Object.entries(info.social).filter(([, href]) => Boolean(href))
  ) as PublicContactInfo["social"];
  return { ...info, social };
}

/**
 * Loads public site settings and resolves parish contact display values.
 * Prefers Admin Settings (API); falls back to static `site` config.
 */
export function usePublicSiteSettings() {
  const query = useQuery({
    queryKey: ["settings", "public"],
    queryFn: () => siteSettingService.getPublic(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const contact = useMemo(
    () => cleanSocial(resolveContact(query.data)),
    [query.data]
  );

  return {
    ...query,
    contact,
  };
}

export default usePublicSiteSettings;
