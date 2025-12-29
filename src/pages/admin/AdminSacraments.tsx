import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, Download, Check, X, Eye, Bell, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockSacraments = [
  { id: 1, name: "Baptism", category: "Initiation", status: "active", registrationOpen: true, requirements: "Birth certificate, Parents' marriage cert", contact: "Fr. Anthony", requests: 12 },
  { id: 2, name: "First Holy Communion", category: "Initiation", status: "active", registrationOpen: true, requirements: "Baptism certificate, Age 7+", contact: "Catechist Lead", requests: 25 },
  { id: 3, name: "Confirmation", category: "Initiation", status: "active", registrationOpen: false, requirements: "Baptism & Communion certs", contact: "Fr. Peter", requests: 18 },
  { id: 4, name: "Matrimony", category: "Service", status: "active", registrationOpen: true, requirements: "6 months notice, Marriage course", contact: "Marriage Committee", requests: 8 },
  { id: 5, name: "Anointing of the Sick", category: "Healing", status: "active", registrationOpen: true, requirements: "Contact parish office", contact: "Fr. Anthony", requests: 3 },
];

const mockRequests = [
  { id: 1, name: "John Adeyemi", sacrament: "Baptism", date: "2024-01-15", status: "pending", phone: "+234 801 234 5678" },
  { id: 2, name: "Mary & David Okonkwo", sacrament: "Matrimony", date: "2024-01-14", status: "approved", phone: "+234 802 345 6789" },
  { id: 3, name: "Grace Eze", sacrament: "First Holy Communion", date: "2024-01-13", status: "pending", phone: "+234 803 456 7890" },
  { id: 4, name: "Peter Nnamdi", sacrament: "Confirmation", date: "2024-01-12", status: "rejected", phone: "+234 804 567 8901" },
];

const AdminSacraments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Your download will start shortly." });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "outline",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Sacraments Management</h1>
          <p className="text-muted-foreground">Manage sacraments, requirements, and registration requests.</p>
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
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Sacrament</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Sacrament</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Sacrament Name</Label>
                  <Input placeholder="e.g., Baptism" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initiation">Initiation</SelectItem>
                      <SelectItem value="healing">Healing</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea placeholder="List requirements..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input placeholder="e.g., Fr. Anthony" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Registration</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Sacrament added successfully" }); }}>Add Sacrament</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sacraments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sacraments" className="gap-2"><Settings className="h-4 w-4" /> Sacraments</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2"><Bell className="h-4 w-4" /> Registration Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="sacraments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSacraments.map((sacrament) => (
              <Card key={sacrament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{sacrament.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{sacrament.category}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Requirements:</p>
                    <p className="font-medium">{sacrament.requirements}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Contact:</p>
                    <p className="font-medium">{sacrament.contact}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Registration:</span>
                      <Badge variant={sacrament.registrationOpen ? "default" : "secondary"}>
                        {sacrament.registrationOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    <Badge variant="outline">{sacrament.requests} requests</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search requests..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sacrament</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell><Badge variant="secondary">{request.sacrament}</Badge></TableCell>
                    <TableCell>{request.phone}</TableCell>
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
    </div>
  );
};

export default AdminSacraments;
