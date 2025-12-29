import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, Download, Users, Calendar, MapPin, Phone, Upload, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockGroups = [
  { id: 1, name: "Catholic Men Organisation (CMO)", category: "Societies", patronSaint: "St. Joseph", meetingDay: "1st Sunday", meetingTime: "After 9AM Mass", venue: "Parish Hall", contact: "+234 801 234 5678", members: 120, status: "active", featured: true, logo: null },
  { id: 2, name: "Catholic Women Organisation (CWO)", category: "Societies", patronSaint: "Our Lady of Grace", meetingDay: "2nd Sunday", meetingTime: "After 9AM Mass", venue: "Parish Hall", contact: "+234 802 345 6789", members: 180, status: "active", featured: true, logo: null },
  { id: 3, name: "Legion of Mary", category: "Pious Societies", patronSaint: "Blessed Virgin Mary", meetingDay: "Every Saturday", meetingTime: "4:00 PM", venue: "Meeting Room A", contact: "+234 803 456 7890", members: 45, status: "active", featured: false, logo: null },
  { id: 4, name: "St. Anthony Youth Movement", category: "Youth", patronSaint: "St. Anthony of Padua", meetingDay: "Every Sunday", meetingTime: "5:00 PM", venue: "Youth Center", contact: "+234 804 567 8901", members: 85, status: "active", featured: true, logo: null },
  { id: 5, name: "Choir", category: "Liturgical", patronSaint: "St. Cecilia", meetingDay: "Every Saturday", meetingTime: "4:00 PM", venue: "Choir Room", contact: "+234 805 678 9012", members: 50, status: "active", featured: false, logo: null },
  { id: 6, name: "Knights of St. Mulumba", category: "Societies", patronSaint: "St. Mulumba", meetingDay: "3rd Sunday", meetingTime: "After 9AM Mass", venue: "Conference Room", contact: "+234 806 789 0123", members: 35, status: "active", featured: false, logo: null },
];

const AdminGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const filteredGroups = mockGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || group.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Your download will start shortly." });
  };

  const getInitials = (name: string) => name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Groups & Societies</h1>
          <p className="text-muted-foreground">Manage parish groups, societies, and organizations.</p>
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
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Group</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add Group/Society</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Button variant="outline" size="sm">Upload Logo</Button>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 200x200px</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input placeholder="e.g., Catholic Men Organisation" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="societies">Societies</SelectItem>
                        <SelectItem value="pious">Pious Societies</SelectItem>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="liturgical">Liturgical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Patron Saint</Label>
                  <Input placeholder="e.g., St. Joseph" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Meeting Day</Label>
                    <Input placeholder="e.g., 1st Sunday" />
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting Time</Label>
                    <Input placeholder="e.g., 5:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input placeholder="e.g., Parish Hall" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input placeholder="+234 801 234 5678" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description of the group..." rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Group added successfully" }); }}>Add Group</Button>
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
              <Input placeholder="Search groups..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Societies">Societies</SelectItem>
                <SelectItem value="Pious Societies">Pious Societies</SelectItem>
                <SelectItem value="Youth">Youth</SelectItem>
                <SelectItem value="Liturgical">Liturgical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 rounded-lg">
                  <AvatarImage src={group.logo || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground rounded-lg">{getInitials(group.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.name.length > 25 ? group.name.substring(0, 25) + "..." : group.name}
                        {group.featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">{group.category}</Badge>
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
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Patron: <span className="text-foreground font-medium">{group.patronSaint}</span></p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{group.meetingDay} at {group.meetingTime}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{group.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{group.contact}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{group.members} members</span>
                </div>
                <Badge variant={group.status === "active" ? "default" : "secondary"}>{group.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGroups;
