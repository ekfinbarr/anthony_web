import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Download, Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MinistryCard from "@/components/serve-others/MinistryCard";
import MinistryEnquiryForm from "@/components/serve-others/MinistryEnquiryForm";
import ministryService from "@/services/ministry.service";
import { CommunityIcon } from "@/components/icons/ParishIcons";
import bannerPhoto from "@/assets/images/st_anthony.webp";

function SafeHtml({ html }: { html: string }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target", "rel"],
      }),
    [html],
  );
  if (!clean) return null;
  return (
    <div
      className="prose prose-neutral max-w-none prose-headings:font-heading prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

const ServeOthersDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [eoiOpen, setEoiOpen] = useState(false);

  const query = useQuery({
    queryKey: ["ministry-slug", slug],
    queryFn: () => ministryService.getBySlug(slug),
    enabled: Boolean(slug),
  });

  const ministry = query.data?.data;
  const related = query.data?.related ?? [];
  const methods = ministry?.joining_methods ?? [];
  const categories = ministry?.categories?.length
    ? ministry.categories
    : ministry?.category
      ? [ministry.category]
      : [];

  if (query.isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-12">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !ministry) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl font-semibold">Ministry not found</h1>
        <p className="mt-3 text-muted-foreground">
          This ministry may be unpublished or the link may be incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link to="/serve-others">Back to Serve Others</Link>
        </Button>
      </div>
    );
  }

  const title = ministry.seo_title || `${ministry.name} | Serve Others`;
  const description =
    ministry.seo_description ||
    ministry.short_description ||
    ministry.description ||
    `Learn about the ${ministry.name} ministry at St. Anthony Catholic Church, Gbaja.`;

  const showJoin =
    methods.length > 0 ||
    Boolean(ministry.joining_instructions) ||
    Boolean(ministry.contact_email) ||
    Boolean(ministry.contact_phone);

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        path={`/serve-others/${ministry.slug}`}
        image={ministry.image || undefined}
      />
      <PageHeader
        title={ministry.name}
        description={ministry.short_description || undefined}
        image={
          ministry.image
            ? { src: ministry.image, alt: "" }
            : { src: bannerPhoto, alt: "" }
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Serve Others", path: "/serve-others" },
          { name: ministry.name, path: `/serve-others/${ministry.slug}` },
        ]}
      >
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary" className="bg-church-pearl/15 text-church-pearl">
                {c.name}
              </Badge>
            ))}
          </div>
        )}
      </PageHeader>

      <main className="bg-church-ivory/30 pb-16">
        <div className="container mx-auto grid gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-10">
            {(ministry.full_description || ministry.description || ministry.mission) && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="font-heading text-2xl font-semibold">
                  About this ministry
                </h2>
                <div className="mt-4 space-y-4 text-foreground/90">
                  {ministry.full_description ? (
                    <SafeHtml html={ministry.full_description} />
                  ) : (
                    <>
                      {ministry.description && <p className="leading-relaxed">{ministry.description}</p>}
                      {ministry.mission && (
                        <p className="leading-relaxed">
                          <span className="font-medium">Mission: </span>
                          {ministry.mission}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            {ministry.activities && (
              <section aria-labelledby="activities-heading">
                <h2 id="activities-heading" className="font-heading text-2xl font-semibold">
                  Activities and responsibilities
                </h2>
                <div className="mt-4">
                  {typeof ministry.activities === "string" ? (
                    <SafeHtml html={ministry.activities} />
                  ) : Array.isArray(ministry.activities) ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {ministry.activities.map((item, i) => (
                        <li key={i}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            )}

            {(ministry.eligibility || ministry.requirements) && (
              <section aria-labelledby="eligibility-heading">
                <h2 id="eligibility-heading" className="font-heading text-2xl font-semibold">
                  Who can join
                </h2>
                <div className="mt-4">
                  {ministry.eligibility ? (
                    <SafeHtml html={ministry.eligibility} />
                  ) : (
                    <p className="leading-relaxed">{ministry.requirements}</p>
                  )}
                </div>
              </section>
            )}

            {showJoin && (
              <section aria-labelledby="join-heading" className="rounded-lg border border-border bg-background p-6">
                <h2 id="join-heading" className="font-heading text-2xl font-semibold">
                  How to join
                </h2>
                {ministry.joining_instructions && (
                  <div className="mt-4">
                    <SafeHtml html={ministry.joining_instructions} />
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  {methods.includes("online_eoi") && (
                    <Button type="button" onClick={() => setEoiOpen(true)}>
                      Express interest online
                    </Button>
                  )}
                  {methods.includes("coordinator") && ministry.contact_email && (
                    <Button asChild variant="outline">
                      <a href={`mailto:${ministry.contact_email}`}>Email the coordinator</a>
                    </Button>
                  )}
                  {methods.includes("parish_office") && (
                    <Button asChild variant="outline">
                      <Link to="/contact">Contact the parish office</Link>
                    </Button>
                  )}
                  {methods.includes("download") &&
                    (ministry.resources || []).map((r) =>
                      r.url ? (
                        <Button key={r.id} asChild variant="outline">
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            {r.title}
                          </a>
                        </Button>
                      ) : null,
                    )}
                </div>
              </section>
            )}

            {(ministry.resources?.length ?? 0) > 0 && (
              <section aria-labelledby="resources-heading">
                <h2 id="resources-heading" className="font-heading text-2xl font-semibold">
                  Downloads and resources
                </h2>
                <ul className="mt-4 space-y-3">
                  {ministry.resources!.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{r.title}</p>
                        {r.description && (
                          <p className="text-sm text-muted-foreground">{r.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {[r.original_filename, r.mime_type].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {r.url && (
                        <Button asChild size="sm" variant="outline">
                          <a href={r.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {related.length > 0 && (
              <section aria-labelledby="related-heading">
                <h2 id="related-heading" className="font-heading text-2xl font-semibold">
                  Related ministries
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {related.map((m) => (
                    <MinistryCard key={m.id} ministry={m} />
                  ))}
                </div>
                <Button asChild variant="link" className="mt-4 px-0">
                  <Link to="/serve-others">View all ministries</Link>
                </Button>
              </section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {(ministry.contact_name ||
              ministry.contact_email ||
              ministry.contact_phone ||
              ministry.contact_instructions ||
              ministry.meeting_location ||
              ministry.meeting_schedule) && (
              <div className="rounded-lg border border-border bg-background p-5">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <CommunityIcon className="h-5 w-5" aria-hidden />
                  <h2 className="font-heading text-lg font-semibold text-foreground">Contact</h2>
                </div>
                <dl className="space-y-3 text-sm">
                  {ministry.contact_name && (
                    <div>
                      <dt className="text-muted-foreground">Coordinator</dt>
                      <dd className="font-medium">{ministry.contact_name}</dd>
                    </div>
                  )}
                  {ministry.contact_email && (
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                      <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${ministry.contact_email}`}>
                        {ministry.contact_email}
                      </a>
                    </div>
                  )}
                  {ministry.contact_phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                      <a className="hover:underline" href={`tel:${ministry.contact_phone}`}>
                        {ministry.contact_phone}
                      </a>
                    </div>
                  )}
                  {ministry.meeting_location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                      <span>{ministry.meeting_location}</span>
                    </div>
                  )}
                  {ministry.meeting_schedule && (
                    <div>
                      <dt className="text-muted-foreground">Schedule</dt>
                      <dd>
                        {typeof ministry.meeting_schedule === "string"
                          ? ministry.meeting_schedule
                          : JSON.stringify(ministry.meeting_schedule)}
                      </dd>
                    </div>
                  )}
                  {ministry.contact_instructions && (
                    <p className="text-muted-foreground">{ministry.contact_instructions}</p>
                  )}
                </dl>
              </div>
            )}

            <div className="rounded-lg border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">
                Looking for another way to serve?
              </p>
              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to="/serve-others">Browse ministries</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/contact">Contact the parish office</Link>
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={eoiOpen} onOpenChange={setEoiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Express interest</DialogTitle>
            <DialogDescription>
              This form sends an enquiry to the parish. It does not confirm membership.
            </DialogDescription>
          </DialogHeader>
          <MinistryEnquiryForm ministry={ministry} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServeOthersDetail;
