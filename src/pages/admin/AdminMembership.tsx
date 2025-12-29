import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreVertical, Eye, Edit, Trash2, Download, Check, X, Users, CreditCard, Printer, Share2, QrCode, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const mockMembers = [
  { id: 1, name: "John Adeyemi", email: "john@email.com", phone: "+234 801 234 5678", status: "active", memberSince: "2020", cardStatus: "issued", cardExpiry: "2025-12-31", family: 4, groups: ["CMO", "Choir"] },
  { id: 2, name: "Mary Okonkwo", email: "mary@email.com", phone: "+234 802 345 6789", status: "active", memberSince: "2019", cardStatus: "expired", cardExpiry: "2023-12-31", family: 3, groups: ["CWO"] },
  { id: 3, name: "David Eze", email: "david@email.com", phone: "+234 803 456 7890", status: "pending", memberSince: "2024", cardStatus: "pending", cardExpiry: null, family: 2, groups: [] },
  { id: 4, name: "Grace Nnamdi", email: "grace@email.com", phone: "+234 804 567 8901", status: "active", memberSince: "2018", cardStatus: "issued", cardExpiry: "2025-06-30", family: 5, groups: ["CWO", "Legion of Mary"] },
];

const mockCardRequests = [
  { id: 1, name: "Peter Adesanya", type: "new", date: "2024-01-15", status: "pending" },
  { id: 2, name: "Mary Okonkwo", type: "renewal", date: "2024-01-14", status: "pending" },
  { id: 3, name: "James Obi", type: "new", date: "2024-01-13", status: "approved" },
];

const AdminMembership = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<typeof mockMembers[0] | null>(null);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const { toast } = useToast();

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Your download will start shortly." });
  };

  const handleShare = (platform: string) => {
    toast({ title: `Sharing via ${platform}`, description: "Opening share dialog..." });
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "outline",
      expired: "destructive",
      issued: "default",
      approved: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Parish Membership</h1>
          <p className="text-muted-foreground">Manage members, parish cards, and registration requests.</p>
        </div>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cards</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,156</div>
            <p className="text-xs text-muted-foreground">76% of members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <Users className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <CreditCard className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="gap-2"><Users className="h-4 w-4" /> Members</TabsTrigger>
          <TabsTrigger value="cards" className="gap-2"><CreditCard className="h-4 w-4" /> Card Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search members..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">Since {member.memberSince}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{member.email}</p>
                        <p className="text-muted-foreground">{member.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>{getStatusBadge(member.cardStatus)}</TableCell>
                    <TableCell>{member.family} members</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.groups.slice(0, 2).map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
                        {member.groups.length > 2 && <Badge variant="outline" className="text-xs">+{member.groups.length - 2}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedMember(member)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit Member</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setShowCardPreview(true)}><CreditCard className="mr-2 h-4 w-4" />View Card</DropdownMenuItem>
                          <DropdownMenuItem><Printer className="mr-2 h-4 w-4" />Print Card</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleShare("WhatsApp")}><MessageSquare className="mr-2 h-4 w-4" />Share via WhatsApp</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare("Email")}><Mail className="mr-2 h-4 w-4" />Share via Email</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCardRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell><Badge variant={request.type === "new" ? "default" : "secondary"}>{request.type}</Badge></TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Details Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Member Details</DialogTitle></DialogHeader>
          {selectedMember && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{getInitials(selectedMember.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                  <p className="text-muted-foreground">{selectedMember.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedMember.status)}
                    {getStatusBadge(selectedMember.cardStatus)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedMember.phone}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{selectedMember.memberSince}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Family Members</p>
                  <p className="font-medium">{selectedMember.family}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Card Expiry</p>
                  <p className="font-medium">{selectedMember.cardExpiry || "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Groups & Organizations</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.groups.length > 0 ? selectedMember.groups.map(g => <Badge key={g}>{g}</Badge>) : <span className="text-muted-foreground">None</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={() => setShowCardPreview(true)}><CreditCard className="h-4 w-4" /> View Parish Card</Button>
                <Button variant="outline" className="gap-2"><Printer className="h-4 w-4" /> Print Card</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Card Preview Dialog */}
      <Dialog open={showCardPreview} onOpenChange={setShowCardPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Parish Card Preview</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs opacity-80">St. Anthony Catholic Church</p>
                  <p className="text-sm font-semibold">PARISH MEMBERSHIP CARD</p>
                </div>
                <QRCodeSVG value="MEMBER-001" size={50} className="bg-white p-1 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarFallback className="bg-white text-primary">JA</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">John Adeyemi</p>
                  <p className="text-xs opacity-80">Member since 2020</p>
                </div>
              </div>
              <div className="text-xs grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
                <div><span className="opacity-80">ID:</span> PAR-2020-001</div>
                <div><span className="opacity-80">Expires:</span> Dec 2025</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 gap-2"><Printer className="h-4 w-4" /> Print</Button>
              <Button variant="outline" className="gap-2"><Share2 className="h-4 w-4" /> Share</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembership;
