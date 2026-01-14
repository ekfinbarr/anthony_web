import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import newsletterCampaignService, { NewsletterCampaign } from "@/services/newsletterCampaign.service";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, PencilLine, Save } from "lucide-react";

/**
 * Admin Newsletter
 *
 * Minimal implementation:
 * - Create a campaign (draft)
 * - Queue it (generates send rows for active newsletter subscribers)
 * - Send now (triggers MailService for pending rows)
 * - View basic stats
 */

/**
 * Newsletter templates (client-side convenience).
 *
 * These templates are intentionally:
 * - Email-friendly (table-ish layout not required, but safe inline styles)
 * - Simple to customize
 *
 * Flow:
 * - Admin selects a template
 * - We overwrite the current HTML content with the template
 * - Admin edits further in Visual or HTML mode
 */
type NewsletterTemplate = {
  id: string;
  name: string;
  description: string;
  html: string;
};

const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    id: "parish-update",
    name: "Parish Update (clean)",
    description: "Header + sections + CTA button (good default)",
    html: `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#111827;">
  <h1 style="margin:0 0 8px; font-size:28px; line-height:1.2;">Parish Update</h1>
  <p style="margin:0 0 18px; color:#4B5563;">A short greeting and a clear summary of what’s happening this week.</p>

  <div style="padding:16px; border:1px solid #E5E7EB; border-radius:12px; background:#FFFFFF; margin:16px 0;">
    <h2 style="margin:0 0 10px; font-size:18px;">This Week</h2>
    <ul style="margin:0; padding-left:18px; color:#374151;">
      <li>Mass schedule highlights</li>
      <li>Special devotions / novenas</li>
      <li>Announcements & community updates</li>
    </ul>
  </div>

  <div style="padding:16px; border:1px solid #E5E7EB; border-radius:12px; background:#FFFFFF; margin:16px 0;">
    <h2 style="margin:0 0 10px; font-size:18px;">Featured</h2>
    <p style="margin:0; color:#374151;">Add one key highlight: Harvest, Galilee Day, retreats, or a parish event.</p>
  </div>

  <div style="margin-top:18px;">
    <a href="{{WEBSITE_URL}}" style="display:inline-block; padding:12px 16px; background:#B8860B; color:#111827; text-decoration:none; border-radius:10px; font-weight:600;">
      Visit the Parish Website
    </a>
    <p style="margin:10px 0 0; font-size:12px; color:#6B7280;">Replace {{WEBSITE_URL}} with your actual link.</p>
  </div>
</div>`,
  },
  {
    id: "minimal-announcement",
    name: "Minimal Announcement",
    description: "Single message + footer",
    html: `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#111827;">
  <h1 style="margin:0 0 10px; font-size:24px;">Announcement</h1>
  <p style="margin:0 0 12px; color:#374151;">
    Write your announcement here. Keep it short, clear, and actionable.
  </p>
  <p style="margin:0; color:#6B7280; font-size:12px;">
    — St. Anthony of Padua Catholic Church
  </p>
</div>`,
  },
];

/**
 * Build a safe-ish preview document for the iframe.
 *
 * - We intentionally isolate preview styles from the admin dashboard styles.
 * - We also avoid running scripts (iframe sandbox).
 */
function buildEmailPreviewDoc(html: string) {
  const content = (html || "").trim() || `<p style="color:#6B7280; margin:0;">Nothing to preview yet.</p>`;
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Newsletter Preview</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        background: #F3F4F6;
        padding: 24px;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      }
      .wrapper {
        max-width: 640px;
        margin: 0 auto;
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      img { max-width: 100%; height: auto; border-radius: 10px; }
      a { color: #B8860B; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      ${content}
    </div>
  </body>
</html>`;
}

export default function AdminNewsletter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);

  // Create form
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("<p>Hello!</p>");
  const [plainContent, setPlainContent] = useState("");

  // Editing UX:
  // - Visual mode: RichTextEditor (Quill)
  // - HTML mode: raw HTML textarea (monospace)
  const [composerMode, setComposerMode] = useState<"visual" | "html">("visual");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(NEWSLETTER_TEMPLATES[0]?.id ?? "parish-update");

  const canCreate = useMemo(() => Boolean(name.trim() && subject.trim() && htmlContent.trim()), [name, subject, htmlContent]);
  const previewDoc = useMemo(() => buildEmailPreviewDoc(htmlContent), [htmlContent]);

  const applySelectedTemplate = () => {
    const tpl = NEWSLETTER_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;
    setHtmlContent(tpl.html);
    toast({ title: "Template applied", description: tpl.name });
  };

  /**
   * Campaign View/Edit dialog state
   *
   * Flow:
   * - Admin clicks "View / Edit" from the campaigns table.
   * - We fetch the full campaign (includes html/plain content on the show endpoint).
   * - Admin can update fields and save (PUT /api/newsletter-campaigns/{id}).
   */
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<NewsletterCampaign | null>(null);
  const [campaignTab, setCampaignTab] = useState<"details" | "content" | "preview" | "stats">("details");
  const [campaignComposerMode, setCampaignComposerMode] = useState<"visual" | "html">("visual");

  const [draftName, setDraftName] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftHtml, setDraftHtml] = useState("");
  const [draftPlain, setDraftPlain] = useState("");
  const [statsText, setStatsText] = useState<string>("");

  const canEditCampaign = useMemo(() => {
    const status = activeCampaign?.status;
    // Business rule (UX):
    // - Draft/Queued/Cancelled can still be edited.
    // - Sending/Sent are locked to avoid “what got sent” confusion.
    return status !== "sending" && status !== "sent";
  }, [activeCampaign?.status]);

  const campaignPreviewDoc = useMemo(() => buildEmailPreviewDoc(draftHtml), [draftHtml]);

  const openCampaignDialog = async (campaignId: string) => {
    try {
      setCampaignDialogOpen(true);
      setCampaignTab("details");
      setActiveCampaignId(campaignId);
      setStatsText("");
      setLoading(true);

      const res = await newsletterCampaignService.getCampaign(campaignId);
      const c = res.data;
      setActiveCampaign(c);

      // Populate editable draft fields
      setDraftName(c.name ?? "");
      setDraftSubject(c.subject ?? "");
      setDraftHtml(c.html_content ?? "<p>Hello!</p>");
      setDraftPlain(c.plain_content ?? "");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load campaign";
      toast({ title: "Error", description: message, variant: "destructive" });
      setCampaignDialogOpen(false);
      setActiveCampaignId(null);
      setActiveCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  const saveCampaignUpdates = async () => {
    try {
      if (!activeCampaignId) throw new Error("No campaign selected");
      if (!draftName.trim() || !draftSubject.trim()) throw new Error("Name and subject are required");
      if (!draftHtml.trim()) throw new Error("HTML content is required");

      setLoading(true);
      await newsletterCampaignService.updateCampaign(activeCampaignId, {
        name: draftName.trim(),
        subject: draftSubject.trim(),
        html_content: draftHtml,
        plain_content: draftPlain.trim() ? draftPlain.trim() : null,
      });

      toast({ title: "Saved", description: "Campaign updated successfully." });
      await load();

      // Refresh active campaign from API (ensures status/updated_at are current).
      const refreshed = await newsletterCampaignService.getCampaign(activeCampaignId);
      setActiveCampaign(refreshed.data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update campaign";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignStats = async () => {
    try {
      if (!activeCampaignId) return;
      setLoading(true);
      const res = await newsletterCampaignService.getCampaignStats(activeCampaignId);
      setStatsText(`Total ${res.data.total} | Pending ${res.data.pending} | Sent ${res.data.sent} | Failed ${res.data.failed}`);
      toast({ title: "Stats loaded", description: "Campaign stats refreshed." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch stats";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper: extract send stats from an unknown backend response.
   * Keeps this page type-safe even if the API returns slightly different shapes.
   */
  type UnknownRecord = Record<string, unknown>;
  const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;
  const getSendStats = (res: unknown): { sent: number; failed: number } => {
    if (!isRecord(res)) return { sent: 0, failed: 0 };
    const stats = res.stats;
    if (!isRecord(stats)) return { sent: 0, failed: 0 };
    const sent = typeof stats.sent === "number" && Number.isFinite(stats.sent) ? stats.sent : 0;
    const failed = typeof stats.failed === "number" && Number.isFinite(stats.failed) ? stats.failed : 0;
    return { sent, failed };
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await newsletterCampaignService.listCampaigns();
      setCampaigns(res.data || []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load campaigns";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      if (!canCreate) return;
      setLoading(true);
      await newsletterCampaignService.createCampaign({
        name: name.trim(),
        subject: subject.trim(),
        html_content: htmlContent,
        plain_content: plainContent.trim() || undefined,
      });
      toast({ title: "Created", description: "Campaign created successfully." });
      setName("");
      setSubject("");
      setHtmlContent("<p>Hello!</p>");
      setPlainContent("");
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create campaign";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQueue = async (id: string) => {
    try {
      setLoading(true);
      await newsletterCampaignService.queueCampaign(id);
      toast({ title: "Queued", description: "Campaign queued (send list generated)." });
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to queue campaign";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id: string) => {
    try {
      setLoading(true);
      const res = await newsletterCampaignService.sendCampaignNow(id);
      const stats = getSendStats(res);
      toast({
        title: "Send triggered",
        description: `Sent: ${stats.sent}, Failed: ${stats.failed}`,
      });
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to send campaign";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStats = async (id: string) => {
    try {
      setLoading(true);
      const res = await newsletterCampaignService.getCampaignStats(id);
      toast({
        title: "Stats",
        description: `Total ${res.data.total} | Pending ${res.data.pending} | Sent ${res.data.sent} | Failed ${res.data.failed}`,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch stats";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Newsletter</h1>
        <p className="text-muted-foreground mt-1">
          Create and send campaigns to newsletter subscribers (WaitingList source: <code>newsletter</code>).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nl-name">Name</Label>
              <Input id="nl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. January Update" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nl-subject">Subject</Label>
              <Input id="nl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
            </div>
          </div>

          {/* Composer (responsive) */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <Label>Newsletter content</Label>
                <p className="text-xs text-muted-foreground">
                  Use Visual mode for quick writing, or HTML mode for full control. Preview is isolated in an iframe.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Template picker */}
                <div className="flex items-center gap-2">
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEWSLETTER_TEMPLATES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={applySelectedTemplate} disabled={loading}>
                    Apply
                  </Button>
                </div>

                {/* Mode switch */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={composerMode === "visual" ? "default" : "outline"}
                    onClick={() => setComposerMode("visual")}
                    disabled={loading}
                  >
                    Visual
                  </Button>
                  <Button
                    type="button"
                    variant={composerMode === "html" ? "default" : "outline"}
                    onClick={() => setComposerMode("html")}
                    disabled={loading}
                  >
                    HTML
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile: Tabs (Edit / Preview). Desktop: side-by-side columns. */}
            <div className="block lg:hidden">
              <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v === "edit" || v === "preview" ? v : "edit")}>
                <TabsList className="w-full">
                  <TabsTrigger value="edit" className="flex-1">
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-3 space-y-2">
                  {composerMode === "visual" ? (
                    <RichTextEditor
                      value={htmlContent}
                      onChange={(value) => setHtmlContent(value)}
                      placeholder="Write your newsletter content here..."
                      minHeight="360px"
                      className="w-full"
                    />
                  ) : (
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={14}
                      className="font-mono text-sm"
                      placeholder="<h1>Hello</h1>..."
                    />
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-3">
                  <div className="overflow-hidden rounded-lg border bg-muted/30">
                    <iframe
                      title="Newsletter preview"
                      srcDoc={previewDoc}
                      className="h-[420px] w-full"
                      sandbox=""
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
              {/* Editor column */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base">Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {composerMode === "visual" ? (
                    <RichTextEditor
                      value={htmlContent}
                      onChange={(value) => setHtmlContent(value)}
                      placeholder="Write your newsletter content here..."
                      minHeight="520px"
                      className="w-full"
                    />
                  ) : (
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={22}
                      className="font-mono text-sm min-h-[520px]"
                      placeholder="<h1>Hello</h1>..."
                    />
                  )}
                </CardContent>
              </Card>

              {/* Preview column */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base">Live preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border bg-muted/30">
                    <iframe title="Newsletter preview" srcDoc={previewDoc} className="h-[520px] w-full" sandbox="" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="nl-plain">Plain Content (optional)</Label>
            <Textarea id="nl-plain" value={plainContent} onChange={(e) => setPlainContent(e.target.value)} rows={3} />
          </div>

          <Button onClick={handleCreate} disabled={!canCreate || loading}>
            {loading ? "Please wait..." : "Create Campaign"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Campaigns</CardTitle>
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No campaigns yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.subject}</TableCell>
                      <TableCell className="capitalize">{c.status}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loading} aria-label="Campaign actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => openCampaignDialog(c.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View / Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStats(c.id)}>
                              Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQueue(c.id)}>
                              Queue
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSend(c.id)}>
                              Send
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign View/Edit dialog */}
      <Dialog
        open={campaignDialogOpen}
        onOpenChange={(open) => {
          setCampaignDialogOpen(open);
          if (!open) {
            setActiveCampaignId(null);
            setActiveCampaign(null);
            setStatsText("");
            setCampaignTab("details");
          }
        }}
      >
        
        <DialogContent className="max-w-6xl h-full">
          <DialogHeader className="h-full">
            <DialogTitle className="flex items-center justify-between gap-4">
              <span>
                Campaign: <span className="font-semibold">{activeCampaign?.name ?? "—"}</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignComposerMode("visual")}
                  disabled={loading}
                  className={campaignComposerMode === "visual" ? "border-primary" : undefined}
                >
                  Visual
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignComposerMode("html")}
                  disabled={loading}
                  className={campaignComposerMode === "html" ? "border-primary" : undefined}
                >
                  HTML
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveCampaignUpdates}
                  disabled={loading || !canEditCampaign}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              {activeCampaign?.status ? (
                <>
                  Status: <span className="font-medium capitalize">{activeCampaign.status}</span>
                  {!canEditCampaign ? " • This campaign is locked (already sending/sent)." : null}
                </>
              ) : (
                "View and update the campaign."
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={campaignTab} onValueChange={(v) => setCampaignTab(v === "details" || v === "content" || v === "preview" || v === "stats" ? v : "details")}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="stats" onClick={() => loadCampaignStats()}>
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} disabled={!canEditCampaign || loading} />
                </div>
                <div className="space-y-1">
                  <Label>Subject</Label>
                  <Input value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} disabled={!canEditCampaign || loading} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium text-foreground">Created</p>
                  <p>{activeCampaign?.created_at ?? "—"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium text-foreground">Updated</p>
                  <p>{activeCampaign?.updated_at ?? "—"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium text-foreground">Schedule</p>
                  <p>{activeCampaign?.scheduled_at ?? "—"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <PencilLine className="h-4 w-4" /> Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {campaignComposerMode === "visual" ? (
                      <div className="h-[520px]">
                      <RichTextEditor
                        value={draftHtml}
                        onChange={(value) => setDraftHtml(value)}
                        placeholder="Write your campaign content..."
                          minHeight="420px"
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <Textarea
                        value={draftHtml}
                        onChange={(e) => setDraftHtml(e.target.value)}
                        rows={18}
                        className="font-mono text-sm min-h-[420px]"
                        disabled={!canEditCampaign || loading}
                      />
                    )}
                    <div className="space-y-1">
                      <Label>Plain content (optional)</Label>
                      <Textarea
                        value={draftPlain}
                        onChange={(e) => setDraftPlain(e.target.value)}
                        rows={3}
                        disabled={!canEditCampaign || loading}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Live preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-lg border bg-muted/30">
                      <iframe title="Campaign preview" srcDoc={campaignPreviewDoc} className="h-[520px] w-full" sandbox="" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                <iframe title="Campaign preview" srcDoc={campaignPreviewDoc} className="h-[640px] w-full" sandbox="" />
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4 space-y-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  {statsText || "Click Stats tab to load the latest stats."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadCampaignStats} disabled={loading || !activeCampaignId}>
                  Refresh stats
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}


