/**
 * Admin — edit one Order of Mass / rite and its text in each language.
 *
 * Section bodies use the pamphlet markup from src/lib/liturgyText.ts so text
 * can be pasted from the parish booklets with light edits.
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUp, ClipboardPaste, Copy, Eye, HelpCircle, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import LiturgyTextRenderer from "@/components/liturgy/LiturgyTextRenderer";
import { LITURGY_ICONS } from "@/components/liturgy/liturgyIcons";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import liturgyService, {
  type AdminLiturgyResource,
  type AdminLiturgyText,
  type LiturgyCategory,
  type LiturgyLanguage,
  type LiturgySection,
} from "@/services/liturgy.service";

const MARKUP_HELP: [string, string][] = [
  ["## Penitential Act", "Sub-heading inside a section"],
  ["> The people stand.", "Instruction (rubric) — shown in red italics"],
  ["P: The Lord be with you.", "Priest / minister line (P, D, L, Priest, Leader, Reader, Àlùfáà, Fada …)"],
  ["R: And with your spirit.", "People's part — shown in bold (R, All, People, Gbogbo, Ndị mmadụ, Parents …)"],
  ["@Choir: Alleluia!", "Any other speaker — start the line with @"],
  ["(next line, no label)", "Continues the line above, e.g. a long prayer"],
  ["(blank line)", "Ends the current prayer or paragraph"],
];

/** "# Title" lines start a new section; anything before the first one is the introduction. */
function splitPastedText(raw: string): { introduction: string; sections: LiturgySection[] } {
  const sections: LiturgySection[] = [];
  const intro: string[] = [];
  for (const line of raw.replace(/\r\n/g, "\n").split("\n")) {
    const heading = line.match(/^#\s+(.+)$/);
    if (heading) {
      sections.push({ title: heading[1].trim(), body: "" });
    } else if (sections.length) {
      const last = sections[sections.length - 1];
      last.body = last.body ? `${last.body}\n${line}` : line;
    } else {
      intro.push(line);
    }
  }
  return {
    introduction: intro.join("\n").trim(),
    sections: sections.map((s) => ({ ...s, body: s.body.trim() })),
  };
}

// ---------------------------------------------------------------- Details

const DetailsCard = ({ resource, categories }: { resource: AdminLiturgyResource; categories: Record<string, string> }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    title: resource.title,
    slug: resource.slug,
    category: resource.category,
    summary: resource.summary ?? "",
    icon: resource.icon ?? "book",
    sort_order: resource.sort_order,
    is_published: resource.is_published,
  }));

  const save = useMutation({
    mutationFn: () => liturgyService.update(resource.id, { ...form, summary: form.summary || null }),
    onSuccess: (updated) => {
      setForm((f) => ({ ...f, slug: updated.slug }));
      queryClient.invalidateQueries({ queryKey: ["admin", "liturgy-resources"] });
      queryClient.invalidateQueries({ queryKey: ["liturgy-resources"] });
      notify.success("Details saved");
    },
    onError: (error) => notify.error(error),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <CardDescription>How this celebration appears in the list on the public page.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="r-title">Title</Label>
            <Input id="r-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-slug">Link name</Label>
            <Input id="r-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as LiturgyCategory })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LITURGY_ICONS).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon framed={false} className="h-5 w-5" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-order">Order</Label>
              <Input
                id="r-order"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="r-summary">Summary</Label>
            <Textarea
              id="r-summary"
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="One sentence shown on the celebration's card"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              Show on the public page
            </label>
            <Button type="submit" disabled={save.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------- Text editor

type Draft = { title: string; introduction: string; sections: LiturgySection[]; is_published: boolean };

const toDraft = (text: AdminLiturgyText | undefined, fallbackTitle: string): Draft => ({
  title: text?.title ?? fallbackTitle,
  introduction: text?.introduction ?? "",
  sections: text?.sections?.length ? text.sections.map((s) => ({ ...s })) : [{ title: "", body: "" }],
  is_published: text?.is_published ?? false,
});

const LanguageTextEditor = ({
  resource,
  language,
  existing,
  english,
}: {
  resource: AdminLiturgyResource;
  language: LiturgyLanguage;
  existing?: AdminLiturgyText;
  english?: AdminLiturgyText;
}) => {
  const queryClient = useQueryClient();
  const initial = useMemo(() => toDraft(existing, resource.title), [existing, resource.title]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "liturgy-resources"] });
    queryClient.invalidateQueries({ queryKey: ["liturgy-resources"] });
  };

  const save = useMutation({
    mutationFn: () =>
      liturgyService.saveText(resource.id, language.code, {
        title: draft.title.trim(),
        introduction: draft.introduction.trim() || null,
        sections: draft.sections.filter((s) => s.title.trim() || s.body.trim()).map((s) => ({ ...s, title: s.title.trim() || "Untitled" })),
        is_published: draft.is_published,
      }),
    onSuccess: (saved) => {
      // Normalise the draft to what was stored so "Unsaved changes" clears.
      setDraft(toDraft(saved, resource.title));
      refresh();
      notify.success(`${language.name} text saved`);
    },
    onError: (error) => notify.error(error),
  });

  const destroy = useMutation({
    mutationFn: () => liturgyService.removeText(resource.id, language.code),
    onSuccess: () => {
      refresh();
      setConfirmDelete(false);
      notify.success(`${language.name} text deleted`);
    },
    onError: (error) => notify.error(error),
  });

  const setSection = (index: number, patch: Partial<LiturgySection>) =>
    setDraft((d) => ({ ...d, sections: d.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));

  const moveSection = (index: number, delta: number) =>
    setDraft((d) => {
      const sections = [...d.sections];
      const [item] = sections.splice(index, 1);
      sections.splice(index + delta, 0, item);
      return { ...d, sections };
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "edit" | "preview")}>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-auto flex flex-wrap gap-2">
          {!existing && english && language.code !== "en" && (
            <Button variant="outline" size="sm" onClick={() => setDraft({ ...toDraft(english, resource.title), is_published: false })}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Start from English
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setPasteOpen(true)}>
            <ClipboardPaste className="mr-2 h-3.5 w-3.5" />
            Paste whole text
          </Button>
        </div>
      </div>

      {mode === "preview" ? (
        <div className="rounded-xl border bg-church-pearl p-5 sm:p-8" lang={language.code}>
          <h2 className="font-serif text-3xl font-bold text-church-charcoal">{draft.title}</h2>
          {draft.introduction && <p className="mt-2 text-church-charcoal/70">{draft.introduction}</p>}
          <div className="mt-6 space-y-5">
            {draft.sections.map((s, i) => (
              <section key={i} className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-heading text-xl font-bold">
                  {i + 1}. {s.title || "Untitled"}
                </h3>
                <LiturgyTextRenderer body={s.body} />
              </section>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`t-title-${language.code}`}>Title ({language.name})</Label>
              <Input
                id={`t-title-${language.code}`}
                lang={language.code}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`t-intro-${language.code}`}>Introduction (optional)</Label>
              <Input
                id={`t-intro-${language.code}`}
                lang={language.code}
                value={draft.introduction}
                onChange={(e) => setDraft({ ...draft, introduction: e.target.value })}
              />
            </div>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-4 w-4" />
              How to format the text
            </CollapsibleTrigger>
            <CollapsibleContent>
              <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-[auto_1fr]">
                {MARKUP_HELP.map(([example, meaning]) => (
                  <div key={example} className="contents">
                    <dt className="font-mono text-xs text-foreground">{example}</dt>
                    <dd className="text-muted-foreground">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </CollapsibleContent>
          </Collapsible>

          <ol className="space-y-4">
            {draft.sections.map((s, i) => (
              <li key={i} className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {i + 1}
                  </span>
                  <Input
                    aria-label={`Section ${i + 1} title`}
                    lang={language.code}
                    value={s.title}
                    placeholder="Section title, e.g. Introductory Rites"
                    onChange={(e) => setSection(i, { title: e.target.value })}
                    className="font-semibold"
                  />
                  <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => moveSection(i, -1)} aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={i === draft.sections.length - 1}
                    onClick={() => moveSection(i, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={draft.sections.length === 1}
                    onClick={() => setDraft((d) => ({ ...d, sections: d.sections.filter((_, j) => j !== i) }))}
                    aria-label="Remove section"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Textarea
                  aria-label={`Section ${i + 1} text`}
                  lang={language.code}
                  value={s.body}
                  onChange={(e) => setSection(i, { body: e.target.value })}
                  rows={Math.min(24, Math.max(8, s.body.split("\n").length + 1))}
                  className="font-mono text-sm leading-relaxed"
                  placeholder={"P: The Lord be with you.\nR: And with your spirit."}
                />
              </li>
            ))}
          </ol>
          <Button variant="outline" onClick={() => setDraft((d) => ({ ...d, sections: [...d.sections, { title: "", body: "" }] }))}>
            <Plus className="mr-2 h-4 w-4" />
            Add section
          </Button>
        </>
      )}

      <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-4 border-t bg-background/95 px-6 py-3 backdrop-blur">
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
          Publish {language.name}
        </label>
        {dirty && <span className="text-xs font-medium text-amber-600">Unsaved changes</span>}
        <div className="ml-auto flex gap-2">
          {existing && (
            <Button variant="outline" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete {language.name}
            </Button>
          )}
          <Button onClick={() => save.mutate()} disabled={save.isPending || !draft.title.trim()}>
            <Save className="mr-2 h-4 w-4" />
            Save {language.name}
          </Button>
        </div>
      </div>

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Paste the whole text</DialogTitle>
            <DialogDescription>
              Start each section with a line like <code className="font-mono"># Introductory Rites</code>. This replaces the
              sections below (nothing is saved until you click Save).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={18}
            lang={language.code}
            className="font-mono text-sm"
            placeholder={"# Introductory Rites\nP: In the name of the Father…\nR: Amen.\n\n# Liturgy of the Word\n…"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!pasted.trim()}
              onClick={() => {
                const parsed = splitPastedText(pasted);
                if (parsed.sections.length === 0) {
                  notify.error("No sections found", "Start each section with a line beginning with “# ”.");
                  return;
                }
                setDraft((d) => ({ ...d, introduction: parsed.introduction || d.introduction, sections: parsed.sections }));
                setPasteOpen(false);
                setPasted("");
                setMode("preview");
              }}
            >
              Use this text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${language.name} text`}
        description="The other languages are not affected."
        itemName={existing?.title}
        onConfirm={() => destroy.mutate()}
        isLoading={destroy.isPending}
      />
    </div>
  );
};

// ---------------------------------------------------------------- Page

const AdminLiturgyEditor = () => {
  const { id = "" } = useParams();
  const [language, setLanguage] = useState("en");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "liturgy-resources", id],
    queryFn: () => liturgyService.adminGet(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">This celebration could not be loaded.</p>
        <Button asChild variant="outline">
          <Link to="/admin/liturgy">Back to list</Link>
        </Button>
      </div>
    );
  }

  const resource = data.data;
  const { languages, categories } = data.meta;
  const texts = new Map(resource.texts.map((t) => [t.language, t]));
  const current = languages.find((l) => l.code === language) ?? languages[0];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <Link to="/admin/liturgy" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Order of Mass &amp; Rites
        </Link>
        <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">{resource.title}</h1>
      </div>

      <DetailsCard key={resource.id} resource={resource} categories={categories} />

      <Card>
        <CardHeader>
          <CardTitle>Text</CardTitle>
          <CardDescription>Write or paste the text in each language. Only published languages appear on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {languages.map((l) => {
              const text = texts.get(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    l.code === current.code ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {l.name}
                  {text ? (
                    <Badge variant={text.is_published ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                      {text.is_published ? "Live" : "Draft"}
                    </Badge>
                  ) : (
                    <span className="text-xs opacity-60">—</span>
                  )}
                </button>
              );
            })}
          </div>

          <LanguageTextEditor
            key={`${resource.id}:${current.code}`}
            resource={resource}
            language={current}
            existing={texts.get(current.code)}
            english={texts.get("en")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLiturgyEditor;
