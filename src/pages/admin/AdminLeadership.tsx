import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, Star, Download, Upload, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockLeaders = [
  { id: 1, name: "Rev. Fr. Anthony Okonkwo", role: "Parish Priest", category: "Clergy", status: "active", featured: true, since: "2020", image: null, welcomeMessage: "Welcome to St. Anthony Parish..." },
  { id: 2, name: "Rev. Fr. Peter Adeyemi", role: "Assistant Parish Priest", category: "Clergy", status: "active", featured: false, since: "2022", image: null, welcomeMessage: null },
  { id: 3, name: "Deacon John Eze", role: "Deacon", category: "Clergy", status: "active", featured: false, since: "2019", image: null, welcomeMessage: null },
  { id: 4, name: "Chief Mrs. Grace Nnamdi", role: "Lay President", category: "Lay Leaders", status: "active", featured: true, since: "2023", image: null, welcomeMessage: null },
  { id: 5, name: "Mr. David Okafor", role: "Parish Secretary", category: "Administration", status: "active", featured: false, since: "2021", image: null, welcomeMessage: null },
];

const AdminLeadership = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const filteredLeaders = mockLeaders.filter(leader => {
    const matchesSearch = leader.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || leader.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getInitials = (name: string) => name.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Your download will start shortly." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Leadership Management</h1>
          <p className="text-muted-foreground">Manage parish priests and leadership profiles.</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Leader</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add Parish Leader</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Button variant="outline" size="sm">Upload Photo</Button>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 400x400px</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Rev. Fr. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role/Title</Label>
                    <Input placeholder="Parish Priest" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clergy">Clergy</SelectItem>
                        <SelectItem value="lay-leaders">Lay Leaders</SelectItem>
                        <SelectItem value="administration">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Since Year</Label>
                    <Input type="number" placeholder="2020" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Welcome Message (for Parish Priest)</Label>
                  <Textarea placeholder="Write welcome message..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Biography</Label>
                  <Textarea placeholder="Brief biography..." rows={4} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Leader added successfully" }); }}>Add Leader</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leaders..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Clergy">Clergy</SelectItem>
                <SelectItem value="Lay Leaders">Lay Leaders</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeaders.map((leader) => (
          <Card key={leader.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={leader.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">{getInitials(leader.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {leader.name}
                        {leader.featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                      </CardTitle>
                      <p className="text-sm text-primary font-medium">{leader.role}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Star className="mr-2 h-4 w-4" />Feature</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <Badge variant="secondary">{leader.category}</Badge>
                <span className="text-muted-foreground">Since {leader.since}</span>
              </div>
              {leader.welcomeMessage && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{leader.welcomeMessage}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">Edit Profile</Button>
                {leader.role === "Parish Priest" && (
                  <Button variant="outline" size="sm">Update Message</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLeadership;
