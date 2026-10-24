/**
 * Livestream embed / thumbnail / external-link helpers.
 */

import { extractYouTubeId, extractVimeoId, getVideoEmbedUrl } from "@/components/sermons/sermonMedia";
import type { Livestream, LivestreamPlatform } from "@/services/livestream.service";
import { site } from "@/config/site";

export type LiveEmbedSource = {
  kind: "iframe" | "html" | "none";
  /** Safe iframe src for iframe kind */
  src?: string;
  /** Sanitized HTML from API for html kind */
  html?: string;
  /** Open on provider when embed unavailable */
  externalUrl?: string;
  poster?: string;
  title: string;
};

function youtubeEmbed(id: string, live = false): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (live) params.set("autoplay", "0");
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function facebookEmbed(videoIdOrUrl: string): string {
  const href = videoIdOrUrl.startsWith("http")
    ? videoIdOrUrl
    : `https://www.facebook.com/video.php?v=${videoIdOrUrl}`;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=560`;
}

function twitchEmbed(channelOrVideo: string): string {
  const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
  if (/^\d+$/.test(channelOrVideo) || channelOrVideo.startsWith("v")) {
    return `https://player.twitch.tv/?video=${encodeURIComponent(channelOrVideo)}&parent=${parent}&autoplay=false`;
  }
  return `https://player.twitch.tv/?channel=${encodeURIComponent(channelOrVideo)}&parent=${parent}&autoplay=false`;
}

export function livestreamThumbnail(stream: Pick<Livestream, "thumbnail_url" | "platform" | "platform_video_id" | "recorded_url">): string | undefined {
  if (stream.thumbnail_url) return stream.thumbnail_url;
  const yt =
    extractYouTubeId(stream.recorded_url) ||
    (stream.platform === "youtube" ? stream.platform_video_id : null) ||
    extractYouTubeId(stream.platform_video_id);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  return undefined;
}

export function livestreamExternalUrl(stream: Pick<Livestream, "platform" | "platform_video_id" | "recorded_url" | "embed_html">): string | undefined {
  if (stream.recorded_url) return stream.recorded_url;

  const id = stream.platform_video_id?.trim();
  if (!id) {
    return site.social.youtube;
  }

  switch (stream.platform as LivestreamPlatform) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${id}`;
    case "facebook":
      return id.startsWith("http") ? id : `https://www.facebook.com/watch/?v=${id}`;
    case "vimeo":
      return `https://vimeo.com/${id}`;
    case "twitch":
      return `https://www.twitch.tv/${id}`;
    default:
      return site.social.youtube;
  }
}

/**
 * Resolve how to play a livestream or recording.
 * Prefer recorded_url for ended streams when present.
 */
export function resolveLiveEmbed(
  stream: Livestream,
  options?: { preferRecording?: boolean }
): LiveEmbedSource {
  const title = stream.title;
  const preferRecording = options?.preferRecording ?? stream.status === "ended";
  const poster = livestreamThumbnail(stream);
  const externalUrl = livestreamExternalUrl(stream);

  if (preferRecording && stream.recorded_url) {
    const embedFromRecording = getVideoEmbedUrl(stream.recorded_url);
    if (embedFromRecording) {
      return { kind: "iframe", src: embedFromRecording, externalUrl: stream.recorded_url, poster, title };
    }
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(stream.recorded_url)) {
      return { kind: "iframe", src: stream.recorded_url, externalUrl: stream.recorded_url, poster, title };
    }
  }

  if (stream.embed_html && /<iframe/i.test(stream.embed_html)) {
    return { kind: "html", html: stream.embed_html, externalUrl, poster, title };
  }

  const id = stream.platform_video_id?.trim();
  if (id) {
    switch (stream.platform) {
      case "youtube":
        return { kind: "iframe", src: youtubeEmbed(id), externalUrl, poster, title };
      case "facebook":
        return { kind: "iframe", src: facebookEmbed(id), externalUrl, poster, title };
      case "vimeo":
        return {
          kind: "iframe",
          src: `https://player.vimeo.com/video/${extractVimeoId(id) || id}`,
          externalUrl,
          poster,
          title,
        };
      case "twitch":
        return { kind: "iframe", src: twitchEmbed(id), externalUrl, poster, title };
      default:
        break;
    }
  }

  if (stream.recorded_url) {
    const embed = getVideoEmbedUrl(stream.recorded_url);
    if (embed) return { kind: "iframe", src: embed, externalUrl: stream.recorded_url, poster, title };
  }

  return { kind: "none", externalUrl, poster, title };
}

/** Calendar helpers for a scheduled livestream */
export function buildLivestreamGoogleCalendarUrl(stream: Livestream): string | null {
  if (!stream.scheduled_start_time) return null;
  const start = new Date(stream.scheduled_start_time);
  if (Number.isNaN(start.getTime())) return null;
  const end = stream.end_time
    ? new Date(stream.end_time)
    : new Date(start.getTime() + 90 * 60 * 1000);

  const stamp = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: stream.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: stream.description || `Livestream from ${site.name}`,
    location: site.name,
    ctz: "Africa/Lagos",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadLivestreamIcs(stream: Livestream): boolean {
  if (!stream.scheduled_start_time) return false;
  const start = new Date(stream.scheduled_start_time);
  const end = stream.end_time
    ? new Date(stream.end_time)
    : new Date(start.getTime() + 90 * 60 * 1000);

  const stamp = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//St Anthony Catholic Church Gbaja//Livestream//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${stream.id}@stanthonygbaja`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(stream.title)}`,
    `DESCRIPTION:${escape(stream.description || "")}`,
    `LOCATION:${escape(site.name)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${stream.title.replace(/\s+/g, "-").toLowerCase() || "livestream"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
