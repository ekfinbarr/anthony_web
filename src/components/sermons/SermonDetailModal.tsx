import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileText,
  Headphones,
  Play,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import sermonService, { type Sermon } from "@/services/sermon.service";
import {
  formatSermonDate,
  getVideoEmbedUrl,
  isDirectVideoUrl,
  sermonThumbnail,
} from "@/components/sermons/sermonMedia";
import { mediaUrl } from "@/components/parish-home/media";

type SermonDetailModalProps = {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional sermon from list to show while detail loads */
  preview?: Sermon | null;
};

type PlayerMode = "video" | "audio" | "notes";

const SermonDetailModal = ({ slug, open, onOpenChange, preview }: SermonDetailModalProps) => {
  const [mode, setMode] = useState<PlayerMode>("video");

  const { data: sermon, isLoading, isError } = useQuery({
    queryKey: ["sermon", "slug", slug],
    queryFn: () => sermonService.getBySlug(slug!),
    enabled: open && Boolean(slug),
  });

  const display = sermon ?? preview ?? null;

  // Choose the best available media whenever a different sermon (or its media) loads.
  const mediaKey = display ? `${display.id}|${display.video_url ?? ""}|${display.audio_url ?? ""}` : null;
  const [modeFor, setModeFor] = useState<string | null>(null);
  if (display && mediaKey !== modeFor) {
    setModeFor(mediaKey);
    setMode(display.video_url ? "video" : display.audio_url ? "audio" : "notes");
  }

  const thumb = display ? sermonThumbnail(display) : undefined;
  const date = display ? formatSermonDate(display.preached_date || display.date) : "";
  const embedUrl = display ? getVideoEmbedUrl(display.video_url) : null;
  const directVideo = display ? isDirectVideoUrl(display.video_url) : false;

  const handleDownloadNotes = async () => {
    if (!display?.id || !display.notes_url) return;
    try {
      await sermonService.recordDownload(display.id);
    } catch {
      // non-blocking
    }
    window.open(mediaUrl(display.notes_url) || display.notes_url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-xl">
        <div className="relative bg-church-charcoal">
          {mode === "video" && display?.video_url ? (
            <div className="aspect-video w-full bg-black">
              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={display.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : directVideo ? (
                <video
                  key={display.video_url}
                  src={mediaUrl(display.video_url) || display.video_url}
                  controls
                  poster={thumb}
                  className="h-full w-full"
                />
              ) : (
                <a
                  href={display.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full items-center justify-center text-church-pearl underline"
                >
                  Open video
                </a>
              )}
            </div>
          ) : mode === "audio" && display?.audio_url ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-6 bg-gradient-to-br from-church-brown to-church-charcoal px-6">
              {thumb ? (
                <img src={thumb} alt="" className="h-28 w-28 rounded-lg object-cover shadow-lg sm:h-36 sm:w-36" />
              ) : null}
              <audio
                key={display.audio_url}
                src={mediaUrl(display.audio_url) || display.audio_url}
                controls
                className="w-full max-w-md"
              />
            </div>
          ) : thumb ? (
            <img src={thumb} alt="" className="aspect-video w-full object-cover opacity-90" />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-church-brown/80 text-church-gold-soft">
              <Play className="h-12 w-12" />
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[min(48vh,420px)]">
          <div className="space-y-4 p-5 sm:p-6">
            {isLoading && !preview ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : isError && !display ? (
              <p className="text-sm text-destructive">Unable to load this sermon.</p>
            ) : display ? (
              <>
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="font-serif text-2xl font-bold leading-tight text-church-charcoal sm:text-3xl">
                    {display.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Sermon details for {display.title}
                  </DialogDescription>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {display.speaker}
                    </span>
                    {date ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {date}
                      </span>
                    ) : null}
                    {typeof display.view_count === "number" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {display.view_count.toLocaleString()} views
                      </span>
                    ) : null}
                  </div>
                </DialogHeader>

                <div className="flex flex-wrap gap-2">
                  {display.video_url ? (
                    <Button
                      size="sm"
                      variant={mode === "video" ? "church" : "outline"}
                      onClick={() => setMode("video")}
                    >
                      <Play className="mr-1.5 h-4 w-4" />
                      Watch
                    </Button>
                  ) : null}
                  {display.audio_url ? (
                    <Button
                      size="sm"
                      variant={mode === "audio" ? "church" : "outline"}
                      onClick={() => setMode("audio")}
                    >
                      <Headphones className="mr-1.5 h-4 w-4" />
                      Listen
                    </Button>
                  ) : null}
                  {display.notes_url ? (
                    <Button size="sm" variant="outline" onClick={handleDownloadNotes}>
                      <Download className="mr-1.5 h-4 w-4" />
                      Notes PDF
                    </Button>
                  ) : null}
                  {display.sermon_notes ? (
                    <Button
                      size="sm"
                      variant={mode === "notes" ? "church" : "outline"}
                      onClick={() => setMode("notes")}
                    >
                      <FileText className="mr-1.5 h-4 w-4" />
                      Read notes
                    </Button>
                  ) : null}
                </div>

                {(display.series || display.scripture_reference || display.duration) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {display.series ? (
                      <span className="rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                        {display.series}
                      </span>
                    ) : null}
                    {display.scripture_reference ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {display.scripture_reference}
                      </span>
                    ) : null}
                    {display.duration ? (
                      <span className="rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                        {display.duration}
                      </span>
                    ) : null}
                  </div>
                )}

                {display.description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {display.description}
                  </p>
                ) : null}

                {mode === "notes" && display.sermon_notes ? (
                  <div
                    className="prose prose-sm max-w-none rounded-lg border border-border/60 bg-muted/30 p-4 text-church-charcoal dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: display.sermon_notes }}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SermonDetailModal;
