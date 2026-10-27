import { useMemo } from "react";
import DOMPurify from "dompurify";
import { format, isValid, parse, parseISO } from "date-fns";
import { Check, ExternalLink, FileText, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mediaUrl } from "@/components/parish-home/media";
import { getVideoEmbedUrl } from "@/components/sermons/sermonMedia";
import { humanize } from "@/services/approval.service";

/**
 * Renders an approval revision snapshot the way readers will see the content:
 * headline, media, formatted body, then the remaining fields as formatted details.
 * Snapshot keys come from each type's ContentTypeAdapter on the server.
 */

type Payload = Record<string, unknown>;

const TITLE_KEYS = ["name", "title", "question", "key"];
const SUMMARY_KEYS = ["summary", "short_description", "position"];
const IMAGE_KEY = /(^image$|image_url$|thumbnail|cover_url$|photo|logo)/;
const VIDEO_KEY = /(^video$|video_url$|recorded_url$)/;
const AUDIO_KEY = /audio_url$/;
const FILE_KEY = /(file_url$|file_path$|notes_url$)/;
const RICH_TEXT_KEYS = new Set([
  "content", "description", "full_description", "body", "answer", "bio", "sermon_notes",
  "instructions", "mission", "vision", "special_notes", "notes",
]);
/** Shown elsewhere (alt text) or not meaningful to a reviewer. */
const HIDDEN_KEYS = new Set(["image_alt"]);

const LABELS: Record<string, string> = {
  post_type: "Post type",
  is_featured: "Featured",
  is_published: "Published",
  is_active: "Active",
  is_public: "Public",
  is_all_day: "All day",
  published_at: "Publish date",
  show_on_website: "Shown on website",
  meta_title: "SEO title",
  meta_description: "SEO description",
  scripture_reference: "Scripture",
  cta_label: "Button label",
  cta_url: "Button link",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const labelFor = (key: string) => LABELS[key] ?? humanize(key);
const isBlank = (v: unknown) => v === null || v === undefined || (typeof v === "string" && v.trim() === "");
const looksLikeHtml = (v: string) => /<\/?[a-z][\s\S]*?>/i.test(v);
const isUrl = (v: string) => /^https?:\/\//i.test(v);

function formatDateValue(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = parse(value, "yyyy-MM-dd", new Date());
    return isValid(d) ? format(d, "EEEE, d MMMM yyyy") : null;
  }
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
    const d = parseISO(value.replace(" ", "T"));
    return isValid(d) ? format(d, "EEEE, d MMMM yyyy 'at' h:mm a") : null;
  }
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const d = parse(value.slice(0, 5), "HH:mm", new Date());
    return isValid(d) ? format(d, "h:mm a") : null;
  }
  return null;
}

function DetailValue({ name, value }: { name: string; value: unknown }) {
  if (isBlank(value)) return <span className="text-muted-foreground">—</span>;

  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
        <Check className="h-4 w-4" aria-hidden /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" aria-hidden /> No
      </span>
    );
  }

  if (name === "day_of_week" && (typeof value === "number" || /^\d$/.test(String(value)))) {
    return <>{DAY_NAMES[Number(value)] ?? String(value)}</>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <Badge key={i} variant="secondary">{typeof item === "object" ? JSON.stringify(item) : String(item)}</Badge>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return <pre className="whitespace-pre-wrap text-xs bg-muted/50 rounded p-2">{JSON.stringify(value, null, 2)}</pre>;
  }

  const text = String(value);
  const date = formatDateValue(text);
  if (date) return <>{date}</>;

  if (isUrl(text)) {
    return (
      <a href={text} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline break-all">
        {text}
        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
      </a>
    );
  }

  // Short machine values (post_type, status, kind…) read better as labels.
  if (/^[a-z][a-z0-9_]*$/.test(text) && text.length <= 32 && !/^(slug|key)$/.test(name)) {
    return <Badge variant="outline">{humanize(text)}</Badge>;
  }

  return <span className="whitespace-pre-wrap break-words">{text}</span>;
}

function RichText({ value }: { value: string }) {
  const html = useMemo(
    () => (looksLikeHtml(value) ? DOMPurify.sanitize(value, { ADD_ATTR: ["target", "rel"] }) : null),
    [value]
  );

  if (!html) return <p className="whitespace-pre-wrap leading-relaxed">{value}</p>;

  return (
    <div
      className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-img:rounded-md prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function VideoPreview({ url }: { url: string }) {
  const embed = getVideoEmbedUrl(url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
        <iframe
          src={embed}
          title="Video preview"
          className="h-full w-full"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  const src = mediaUrl(url);
  return <video src={src} controls preload="metadata" className="w-full rounded-md border bg-black" />;
}

export default function ApprovalContentPreview({ payload }: { payload: Payload }) {
  const entries = Object.entries(payload).filter(([key]) => !HIDDEN_KEYS.has(key));
  const used = new Set<string>();
  const take = (key: string) => {
    used.add(key);
    return payload[key];
  };

  const titleKey = TITLE_KEYS.find((k) => !isBlank(payload[k]));
  const title = titleKey ? String(take(titleKey)) : null;
  const summaryKey = SUMMARY_KEYS.find((k) => !isBlank(payload[k]));
  const summary = summaryKey ? String(take(summaryKey)) : null;

  const images = entries.filter(([k, v]) => IMAGE_KEY.test(k) && typeof v === "string" && !isBlank(v));
  const videos = entries.filter(([k, v]) => VIDEO_KEY.test(k) && typeof v === "string" && !isBlank(v));
  const audios = entries.filter(([k, v]) => AUDIO_KEY.test(k) && typeof v === "string" && !isBlank(v));
  const files = entries.filter(([k, v]) => FILE_KEY.test(k) && typeof v === "string" && !isBlank(v));
  const richText = entries.filter(([k, v]) => typeof v === "string" && !isBlank(v) && (RICH_TEXT_KEYS.has(k) || looksLikeHtml(v)));
  [...images, ...videos, ...audios, ...files, ...richText].forEach(([k]) => used.add(k));

  const embedHtml = typeof payload.embed_html === "string" && !isBlank(payload.embed_html) ? String(take("embed_html")) : null;
  const details = entries.filter(([k]) => !used.has(k) && k !== "embed_html");

  return (
    <div className="space-y-6">
      {(title || summary) && (
        <header className="space-y-2">
          {title && <h2 className="font-heading text-2xl font-bold leading-tight">{title}</h2>}
          {summary && <p className="text-muted-foreground text-base">{summary}</p>}
        </header>
      )}

      {images.map(([key, value]) => (
        <figure key={key} className="space-y-1">
          <img
            src={mediaUrl(String(value))}
            alt={typeof payload.image_alt === "string" && payload.image_alt ? payload.image_alt : `${labelFor(key)} for ${title ?? "content"}`}
            className="max-h-[28rem] w-full rounded-md border object-cover"
            loading="lazy"
          />
          {images.length > 1 && <figcaption className="text-xs text-muted-foreground">{labelFor(key)}</figcaption>}
          {typeof payload.image_alt === "string" && payload.image_alt && key === "image" && (
            <figcaption className="text-xs text-muted-foreground">Alt text: {payload.image_alt}</figcaption>
          )}
        </figure>
      ))}

      {videos.map(([key, value]) => (
        <div key={key} className="space-y-1">
          {videos.length > 1 && <p className="text-xs text-muted-foreground">{labelFor(key)}</p>}
          <VideoPreview url={String(value)} />
        </div>
      ))}

      {embedHtml && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Embed code</p>
          <pre className="whitespace-pre-wrap break-all text-xs bg-muted/50 rounded p-3">{embedHtml}</pre>
        </div>
      )}

      {audios.map(([key, value]) => (
        <audio key={key} src={mediaUrl(String(value))} controls preload="metadata" className="w-full" />
      ))}

      {files.map(([key, value]) => (
        <a
          key={key}
          href={mediaUrl(String(value))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
        >
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="flex-1">{labelFor(key)}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden />
        </a>
      ))}

      {richText.map(([key, value]) => (
        <section key={key} className="space-y-2">
          {(richText.length > 1 || key !== "content") && (
            <h3 className="text-sm font-medium text-muted-foreground">{labelFor(key)}</h3>
          )}
          <RichText value={String(value)} />
        </section>
      ))}

      {details.length > 0 && (
        <section className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {details.map(([key, value]) => (
              <div key={key} className="space-y-0.5 min-w-0">
                <dt className="text-xs text-muted-foreground">{labelFor(key)}</dt>
                <dd className="min-w-0"><DetailValue name={key} value={value} /></dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
