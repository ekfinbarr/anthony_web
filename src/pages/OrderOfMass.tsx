import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Globe2, Info, Printer } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LiturgyTextRenderer from "@/components/liturgy/LiturgyTextRenderer";
import TextSizeControl, { useTextScale } from "@/components/liturgy/TextSizeControl";
import { liturgyIcon } from "@/components/liturgy/liturgyIcons";
import { sectionAnchor } from "@/lib/liturgyText";
import { cn } from "@/lib/utils";
import liturgyService, { type LiturgyLanguage } from "@/services/liturgy.service";

const LANGUAGE_STORAGE_KEY = "liturgy-language";

/** Highlights the section currently in view in the contents list. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const OrderOfMass = () => {
  const [params, setParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const textScale = useTextScale();

  const { data: catalogue, isLoading: listLoading, isError: listError } = useQuery({
    queryKey: ["liturgy-resources"],
    queryFn: liturgyService.list,
    staleTime: 10 * 60_000,
  });

  const resources = catalogue?.data ?? [];
  const languages = useMemo(
    () => new Map<string, LiturgyLanguage>((catalogue?.meta.languages ?? []).map((l) => [l.code, l])),
    [catalogue],
  );

  const slug = params.get("rite") ?? resources[0]?.slug;
  const selected = resources.find((r) => r.slug === slug) ?? resources[0];

  // Language: URL first, then the visitor's last choice, then the default.
  const explicitLang = params.get("lang");
  const preferred = explicitLang ?? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? catalogue?.meta.default_language ?? "en";
  const lang = selected?.languages.includes(preferred) ? preferred : (catalogue?.meta.default_language ?? selected?.languages[0]);

  const { data: detail, isLoading: textLoading, isError: textError } = useQuery({
    queryKey: ["liturgy-resources", selected?.slug, lang],
    queryFn: () => liturgyService.get(selected!.slug, lang),
    enabled: Boolean(selected),
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });

  const text = detail?.data.text;
  const sectionIds = useMemo(() => (text?.sections ?? []).map((s, i) => sectionAnchor(i, s.title)), [text]);
  const activeSection = useActiveSection(sectionIds);

  const update = (next: { rite?: string; lang?: string }) => {
    const merged = new URLSearchParams(params);
    if (next.rite) merged.set("rite", next.rite);
    if (next.lang) {
      merged.set("lang", next.lang);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next.lang);
    }
    setParams(merged, { preventScrollReset: true });
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  const languageName = (code: string) => {
    const l = languages.get(code);
    return l ? (l.native !== l.name ? `${l.native}` : l.name) : code.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-church-pearl">
      <PageHeader
        eyebrow="Pray with the Church"
        title="Order of Mass & Rites"
        description="Follow the Holy Mass and the Church's celebrations — Baptism, wake keep and more — in your language."
      />

      {/* Rite picker */}
      <section aria-label="Choose a celebration" className="relative z-10 -mt-8 print:hidden">
        <div className="container mx-auto px-4">
          {listLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-36 w-64 shrink-0 rounded-2xl sm:flex-1" />
              ))}
            </div>
          ) : listError ? (
            <div className="rounded-2xl border bg-white p-6 text-center text-church-charcoal/70 shadow-sm">
              We couldn't load the prayers right now. Please try again shortly.
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-center text-church-charcoal/70 shadow-sm">
              No celebrations have been published yet.
            </div>
          ) : (
            <ul
              role="tablist"
              aria-label="Celebrations"
              className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3 xl:grid-cols-4"
            >
              {resources.map((r, i) => {
                const Icon = liturgyIcon(r.icon);
                const isActive = r.slug === selected?.slug;
                return (
                  <motion.li
                    key={r.slug}
                    role="presentation"
                    className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto"
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => update({ rite: r.slug })}
                      className={cn(
                        "group relative flex h-full w-full flex-col items-start gap-3 overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold",
                        isActive ? "border-church-gold" : "border-church-charcoal/10",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="liturgy-active-rite"
                          className="absolute inset-x-0 top-0 h-1 bg-gradient-church"
                          transition={{ type: "spring", stiffness: 400, damping: 34 }}
                          aria-hidden="true"
                        />
                      )}
                      <Icon size="md" />
                      <span className="font-heading text-lg font-bold leading-tight text-church-charcoal">{r.title}</span>
                      {r.summary && <span className="line-clamp-2 text-sm text-church-charcoal/65">{r.summary}</span>}
                      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-church-charcoal/50">
                        <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {r.languages.map(languageName).join(" · ")}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {selected && (
        <div className="container mx-auto px-4 pb-16 pt-8 sm:pt-10">
          {/* Toolbar: language, contents (mobile), text size, print */}
          <div className="sticky top-20 z-30 -mx-4 mb-8 border-y border-church-charcoal/10 bg-church-pearl/95 px-4 py-3 backdrop-blur print:hidden lg:mx-0 lg:rounded-2xl lg:border">
            <div className="flex flex-wrap items-center gap-3">
              <div role="radiogroup" aria-label="Language" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
                {selected.languages.map((code) => {
                  const isActive = code === lang;
                  return (
                    <button
                      key={code}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => update({ lang: code })}
                      className={cn(
                        "relative shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                        isActive ? "text-church-charcoal" : "text-church-charcoal/60 hover:text-church-charcoal",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="liturgy-active-language"
                          className="absolute inset-0 rounded-full bg-church-gold-soft shadow-sm"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative">{languageName(code)}</span>
                    </button>
                  );
                })}
              </div>

              {text && text.sections.length > 1 && (
                <Select value={activeSection ?? ""} onValueChange={jumpTo}>
                  <SelectTrigger className="h-9 w-auto min-w-[10rem] rounded-full bg-white lg:hidden" aria-label="Jump to section">
                    <SelectValue placeholder="Jump to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {text.sections.map((s, i) => (
                      <SelectItem key={sectionIds[i]} value={sectionIds[i]}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <TextSizeControl {...textScale} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.print()}
                aria-label="Print"
                className="hidden rounded-full sm:inline-flex"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {textLoading && !text ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : textError || !text ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-church-charcoal/70 shadow-sm">
              This text couldn't be loaded. Please try again shortly.
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
              {/* Contents (desktop) */}
              <aside className="hidden lg:block print:hidden">
                <nav aria-label="Contents" className="sticky top-44">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-church-charcoal/50">Contents</p>
                  <ol className="space-y-1 border-l border-church-charcoal/10">
                    {text.sections.map((s, i) => {
                      const id = sectionIds[i];
                      const isActive = id === activeSection;
                      return (
                        <li key={id}>
                          <a
                            href={`#${id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              jumpTo(id);
                            }}
                            className={cn(
                              "-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors",
                              isActive
                                ? "border-church-gold font-semibold text-church-charcoal"
                                : "border-transparent text-church-charcoal/60 hover:border-church-charcoal/30 hover:text-church-charcoal",
                            )}
                          >
                            {s.title}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                  <Link
                    to="/daily-readings"
                    className="mt-8 flex items-center gap-2 rounded-xl border border-church-gold/40 bg-white p-3 text-sm font-medium text-church-charcoal transition-colors hover:bg-church-gold/10"
                  >
                    <BookOpen className="h-4 w-4 text-church-gold-warm" aria-hidden="true" />
                    Today's readings
                  </Link>
                </nav>
              </aside>

              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={`${selected.slug}:${text.language}`}
                  lang={text.language}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="min-w-0"
                  style={{ fontSize: `${textScale.scale}rem` }}
                >
                  <header className="mb-8">
                    <h2 className="text-balance font-serif text-[2em] font-bold leading-tight text-church-charcoal">
                      {text.title}
                    </h2>
                    {text.introduction && <p className="mt-3 max-w-3xl text-[0.95em] text-church-charcoal/70">{text.introduction}</p>}
                    {explicitLang && explicitLang !== text.language && (
                      <p className="mt-4 inline-flex items-start gap-2 rounded-lg bg-church-gold/15 px-3 py-2 text-sm text-church-brown">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Not yet available in {languageName(explicitLang)} — showing {languageName(text.language)}.
                      </p>
                    )}
                  </header>

                  <div className="space-y-6">
                    {text.sections.map((s, i) => (
                      <section
                        key={sectionIds[i]}
                        id={sectionIds[i]}
                        aria-labelledby={`${sectionIds[i]}-title`}
                        className="scroll-mt-44 rounded-2xl border border-church-charcoal/10 bg-white p-5 shadow-sm sm:p-8 print:break-inside-avoid print:border-0 print:p-0 print:shadow-none"
                      >
                        <h3
                          id={`${sectionIds[i]}-title`}
                          className="mb-5 flex items-center gap-3 font-heading text-[1.3em] font-bold text-church-charcoal"
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-church-charcoal font-serif text-sm text-church-gold-soft"
                            aria-hidden="true"
                          >
                            {i + 1}
                          </span>
                          {s.title}
                        </h3>
                        {s.body.trim() ? (
                          <LiturgyTextRenderer body={s.body} />
                        ) : (
                          <p className="italic text-church-charcoal/50">—</p>
                        )}
                      </section>
                    ))}
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderOfMass;
