import { useCallback, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileType,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/seo/SEOHead";
import BulletinFormatBadge from "@/components/bulletins/BulletinFormatBadge";
import bulletinService, {
  isImageEdition,
  isPdf,
  isWord,
} from "@/services/bulletin.service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BulletinDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageIndex, setImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);

  const archiveReturn = `/bulletin${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const bulletinQuery = useQuery({
    queryKey: ["bulletin", slug],
    queryFn: () => bulletinService.getBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const neighborsQuery = useQuery({
    queryKey: ["bulletin-neighbors", slug],
    queryFn: () => bulletinService.neighbors(slug),
    enabled: Boolean(slug) && bulletinQuery.isSuccess,
  });

  const bulletin = bulletinQuery.data;
  const neighbors = neighborsQuery.data;
  const images = bulletin?.image_urls?.length
    ? bulletin.image_urls
    : bulletin?.file_url && isImageEdition(bulletin.file_format)
      ? [bulletin.file_url]
      : [];

  const handleDownload = useCallback(async () => {
    if (!bulletin) return;
    try {
      const result = await bulletinService.trackDownload(bulletin.slug);
      const url = result.download_url || bulletin.file_url;
      if (!url) {
        toast({
          title: "Download unavailable",
          description: "This edition does not have a downloadable file.",
          variant: "destructive",
        });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      if (bulletin.file_url) {
        window.open(bulletin.file_url, "_blank", "noopener,noreferrer");
      } else {
        toast({
          title: "Download failed",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      }
    }
  }, [bulletin, toast]);

  if (bulletinQuery.isLoading) {
    return (
      <div className="bg-church-pearl/40 py-10">
        <div className="container mx-auto max-w-5xl px-4">
          <Skeleton className="mb-6 h-8 w-48" />
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="aspect-[3/4] w-full md:aspect-[4/3]" />
        </div>
      </div>
    );
  }

  if (bulletinQuery.isError || !bulletin) {
    return (
      <div className="bg-church-pearl/40 py-16">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <SEOHead
            title="Bulletin Not Found"
            description="This parish bulletin could not be found. Browse the bulletin archive for other editions."
            path={`/bulletin/${slug}`}
            noindex
          />
          <h1 className="font-serif text-3xl font-semibold text-church-charcoal">
            Bulletin not found
          </h1>
          <p className="mt-3 text-muted-foreground">
            This edition may be unpublished or the link may be incorrect.
          </p>
          <Button variant="church" className="mt-6" asChild>
            <Link to="/bulletin">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to archive
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const pdf = isPdf(bulletin.file_format);
  const word = isWord(bulletin.file_format);
  const imageMode = isImageEdition(bulletin.file_format) || images.length > 0;

  return (
    <div className="bg-church-pearl/40">
      <SEOHead
        title={bulletin.title}
        description={
          bulletin.description ||
          `Sunday bulletin for ${bulletin.bulletin_date_formatted || bulletin.bulletin_date} from St. Anthony Catholic Church, Gbaja.`
        }
        path={`/bulletin/${bulletin.slug}`}
        image={bulletin.cover_url || bulletin.thumbnail_url || undefined}
      />

      <div className="border-b border-church-gold-warm/15 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild className="text-church-gold-warm">
              <Link to={archiveReturn}>
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Archive
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              {neighbors?.previous && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-church-gold-warm/30"
                  onClick={() => navigate(`/bulletin/${neighbors.previous!.slug}`)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>
              )}
              {neighbors?.next && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-church-gold-warm/30"
                  onClick={() => navigate(`/bulletin/${neighbors.next!.slug}`)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <article className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <BulletinFormatBadge format={bulletin.file_format} />
            {bulletin.file_size_formatted && (
              <span className="text-xs text-muted-foreground">{bulletin.file_size_formatted}</span>
            )}
          </div>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-church-charcoal md:text-4xl">
            {bulletin.title}
          </h1>
          <time
            dateTime={bulletin.bulletin_date}
            className="mt-3 block text-sm font-medium text-church-gold-warm"
          >
            {bulletin.bulletin_date_formatted || bulletin.bulletin_date}
          </time>
          {bulletin.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {bulletin.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {bulletin.file_url && (
              <Button variant="church" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download
              </Button>
            )}
            {bulletin.file_url && (
              <Button variant="outline" className="border-church-gold-warm/30" asChild>
                <a href={bulletin.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                  Open original
                </a>
              </Button>
            )}
          </div>
        </header>

        {pdf && bulletin.file_url && (
          <div className="overflow-hidden rounded-xl border border-church-gold-warm/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-church-gold-warm/10 px-4 py-2">
              <p className="text-sm text-muted-foreground">PDF reader</p>
              <Button variant="ghost" size="sm" asChild>
                <a href={bulletin.file_url} target="_blank" rel="noopener noreferrer">
                  Fullscreen
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Button>
            </div>
            <iframe
              title={`${bulletin.title} PDF`}
              src={`${bulletin.file_url}#view=FitH`}
              className="h-[70vh] min-h-[28rem] w-full bg-church-pearl"
            />
          </div>
        )}

        {word && (
          <div className="rounded-xl border border-church-gold-warm/20 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-church-gold/15 text-church-gold-warm">
              <FileType className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-church-charcoal">
              Word document
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              This edition was published as a Word document. Download the original file to read it
              in Microsoft Word or a compatible app.
            </p>
            <Button variant="church" className="mt-6" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Download Word Document
            </Button>
          </div>
        )}

        {imageMode && images.length > 0 && (
          <div className="rounded-xl border border-church-gold-warm/20 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Image {imageIndex + 1} of {images.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-church-gold-warm/30"
                  onClick={() => setImageZoom((z) => Math.max(1, z - 0.25))}
                  aria-label="Zoom out"
                  disabled={imageZoom <= 1}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-church-gold-warm/30"
                  onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                  aria-label="Zoom in"
                  disabled={imageZoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-auto rounded-lg bg-church-pearl">
              <img
                src={images[imageIndex]}
                alt={`${bulletin.title} — page ${imageIndex + 1}`}
                className={cn(
                  "mx-auto max-h-[75vh] w-auto object-contain transition-transform",
                  imageZoom > 1 && "origin-top",
                )}
                style={{ transform: `scale(${imageZoom})` }}
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-church-gold-warm/30"
                  disabled={imageIndex <= 0}
                  onClick={() => {
                    setImageIndex((i) => i - 1);
                    setImageZoom(1);
                  }}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Previous image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-church-gold-warm/30"
                  disabled={imageIndex >= images.length - 1}
                  onClick={() => {
                    setImageIndex((i) => i + 1);
                    setImageZoom(1);
                  }}
                >
                  Next image
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}

        {!pdf && !word && !imageMode && bulletin.file_url && (
          <div className="rounded-xl border border-church-gold-warm/20 bg-white p-8 text-center">
            <p className="text-muted-foreground">
              Preview is not available for this format. Download or open the original file.
            </p>
            <Button variant="church" className="mt-4" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Download
            </Button>
          </div>
        )}

        <nav
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-church-gold-warm/15 pt-8"
          aria-label="Adjacent bulletin editions"
        >
          {neighbors?.previous ? (
            <Link
              to={`/bulletin/${neighbors.previous.slug}`}
              className="group flex max-w-[45%] flex-col text-left outline-none"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-church-gold-warm">
                Previous edition
              </span>
              <span className="mt-1 font-serif text-base font-semibold text-church-charcoal transition-colors group-hover:text-church-gold-warm group-focus-visible:text-church-gold-warm">
                {neighbors.previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {neighbors?.next ? (
            <Link
              to={`/bulletin/${neighbors.next.slug}`}
              className="group flex max-w-[45%] flex-col text-right outline-none"
            >
              <span className="inline-flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-wider text-church-gold-warm">
                Next edition
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="mt-1 font-serif text-base font-semibold text-church-charcoal transition-colors group-hover:text-church-gold-warm group-focus-visible:text-church-gold-warm">
                {neighbors.next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
};

export default BulletinDetail;
