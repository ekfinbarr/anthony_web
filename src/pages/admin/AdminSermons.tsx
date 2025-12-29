import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Play, Download, Star, Grid, List, BookOpen, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockSermons = [
  { id: 1, title: "The Power of Faith", preacher: "Fr. Anthony", date: "2024-01-14", category: "Sunday Homily", duration: "25 min", status: "published", featured: true, views: 456 },
  { id: 2, title: "Walking with Christ", preacher: "Fr. Peter", date: "2024-01-07", category: "Sunday Homily", duration: "22 min", status: "published", featured: false, views: 325 },
  { id: 3, title: "Preparing for Lent", preacher: "Fr. Anthony", date: "2024-01-13", category: "Weekday Reflection", duration: "15 min", status: "draft", featured: false, views: 0 },
  { id: 4, title: "The Beatitudes", preacher: "Fr. Peter", date: "2023-12-31", category: "Special Occasion", duration: "30 min", status: "published", featured: true, views: 890 },
  { id: 5, title: "Mary's Example", preacher: "Fr. Anthony", date: "2023-12-25", category: "Christmas", duration: "28 min", status: "published", featured: false, views: 654 },
];

const AdminSermons = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const filteredSermons = mockSermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) || sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sermon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      pending: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Sermons Management</h1>
          <p className="text-muted-foreground">Upload and manage church sermons and homilies.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Sermon</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add New Sermon</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Sermon title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preacher</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select preacher" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr-anthony">Fr. Anthony</SelectItem>
                      <SelectItem value="fr-peter">Fr. Peter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday Homily</SelectItem>
                      <SelectItem value="weekday">Weekday Reflection</SelectItem>
                      <SelectItem value="special">Special Occasion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Upload audio or video file</p>
                <Button variant="outline" className="mt-2">Select File</Button>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of the sermon..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Sermon added successfully" }); }}>Add Sermon</Button>
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
              <Input placeholder="Search sermons..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" onClick={() => setViewMode("table")}><List className="h-4 w-4" /></Button>
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}><Grid className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Preacher</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSermons.map((sermon) => (
                <TableRow key={sermon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {sermon.featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                      <span className="font-medium">{sermon.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{sermon.preacher}</TableCell>
                  <TableCell><Badge variant="secondary">{sermon.category}</Badge></TableCell>
                  <TableCell>{sermon.date}</TableCell>
                  <TableCell>{sermon.duration}</TableCell>
                  <TableCell>{sermon.views}</TableCell>
                  <TableCell>{getStatusBadge(sermon.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Play className="mr-2 h-4 w-4" />Play</DropdownMenuItem>
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Star className="mr-2 h-4 w-4" />Feature</DropdownMenuItem>
                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSermons.map((sermon) => (
            <Card key={sermon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {sermon.featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                    <CardTitle className="text-lg">{sermon.title}</CardTitle>
                  </div>
                  {getStatusBadge(sermon.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{sermon.preacher}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{sermon.date}</span>
                </div>
                <Badge variant="secondary">{sermon.category}</Badge>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-1"><Play className="h-4 w-4" /> Play</Button>
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSermons;
