import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Image, Video, Eye, Edit, Trash2, Star, Archive, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockMedia = [
  { id: 1, title: "Christmas Mass 2023", type: "photo", category: "Events", status: "published", featured: true, date: "2023-12-25", thumbnail: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=300" },
  { id: 2, title: "Easter Vigil Service", type: "video", category: "Liturgy", status: "published", featured: false, date: "2023-04-08", thumbnail: "https://images.unsplash.com/photo-1555448248-2571daf6344b?w=300" },
  { id: 3, title: "Youth Camp 2023", type: "photo", category: "Youth", status: "pending", featured: false, date: "2023-08-15", thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300" },
  { id: 4, title: "Parish Anniversary", type: "photo", category: "Events", status: "published", featured: true, date: "2023-10-20", thumbnail: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=300" },
  { id: 5, title: "Choir Performance", type: "video", category: "Music", status: "draft", featured: false, date: "2024-01-05", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
  { id: 6, title: "First Communion Day", type: "photo", category: "Sacraments", status: "published", featured: false, date: "2023-05-14", thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=300" },
];

const AdminGallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  const filteredMedia = mockMedia.filter(media => {
    const matchesSearch = media.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || media.type === typeFilter;
    const matchesStatus = statusFilter === "all" || media.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      pending: "outline",
      archived: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground">Upload and manage photos and videos.</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Upload className="h-4 w-4" /> Upload Media</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Upload Media</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                <Button variant="outline" className="mt-4">Select Files</Button>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Media title" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="liturgy">Liturgy</SelectItem>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="sacraments">Sacraments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsUploadOpen(false); toast({ title: "Media uploaded successfully" }); }}>Upload</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search media..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((media) => (
          <Card key={media.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative aspect-video">
              <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon"><Eye className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon"><Edit className="h-4 w-4" /></Button>
              </div>
              <div className="absolute top-2 left-2 flex gap-1">
                {media.type === "video" ? (
                  <Badge variant="secondary"><Video className="h-3 w-3 mr-1" />Video</Badge>
                ) : (
                  <Badge variant="secondary"><Image className="h-3 w-3 mr-1" />Photo</Badge>
                )}
              </div>
              {media.featured && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">{media.title}</h3>
                  <p className="text-xs text-muted-foreground">{media.category} • {media.date}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem><Star className="mr-2 h-4 w-4" />Feature</DropdownMenuItem>
                    <DropdownMenuItem><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-2">{getStatusBadge(media.status)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGallery;
