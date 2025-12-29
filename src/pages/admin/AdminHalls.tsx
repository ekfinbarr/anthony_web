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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, Download, Check, X, Eye, Building, Calendar, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockHalls = [
  { id: 1, name: "Main Parish Hall", category: "Large Halls", capacity: 500, pricePerDay: 150000, status: "available", featured: true, bookings: 12 },
  { id: 2, name: "Conference Room A", category: "Meeting Rooms", capacity: 50, pricePerDay: 25000, status: "available", featured: false, bookings: 8 },
  { id: 3, name: "Youth Center", category: "Special Venues", capacity: 200, pricePerDay: 75000, status: "maintenance", featured: false, bookings: 5 },
  { id: 4, name: "Garden Pavilion", category: "Outdoor Spaces", capacity: 300, pricePerDay: 100000, status: "available", featured: true, bookings: 15 },
];

const mockBookings = [
  { id: 1, hall: "Main Parish Hall", client: "John Adeyemi", event: "Wedding Reception", date: "2024-02-15", status: "pending", amount: 150000 },
  { id: 2, hall: "Conference Room A", client: "Youth Ministry", event: "Leadership Meeting", date: "2024-01-20", status: "approved", amount: 0 },
  { id: 3, hall: "Garden Pavilion", client: "Mary Okonkwo", event: "Birthday Celebration", date: "2024-02-10", status: "pending", amount: 100000 },
  { id: 4, hall: "Main Parish Hall", client: "KSC Council", event: "Annual Dinner", date: "2024-03-01", status: "approved", amount: 75000 },
];

const AdminHalls = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Your download will start shortly." });
  };

  const formatAmount = (amount: number) => amount === 0 ? "Free" : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      maintenance: "destructive",
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Halls & Rentals</h1>
          <p className="text-muted-foreground">Manage parish halls, venues, and booking requests.</p>
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
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Hall</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Hall/Venue</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Hall Name</Label>
                  <Input placeholder="e.g., Main Parish Hall" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="large">Large Halls</SelectItem>
                        <SelectItem value="meeting">Meeting Rooms</SelectItem>
                        <SelectItem value="outdoor">Outdoor Spaces</SelectItem>
                        <SelectItem value="special">Special Venues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" placeholder="500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price per Day (₦)</Label>
                  <Input type="number" placeholder="150000" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the hall..." rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Hall added successfully" }); }}>Add Hall</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="halls" className="space-y-6">
        <TabsList>
          <TabsTrigger value="halls" className="gap-2"><Building className="h-4 w-4" /> Halls & Venues</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2"><Calendar className="h-4 w-4" /> Booking Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockHalls.map((hall) => (
              <Card key={hall.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{hall.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{hall.category}</Badge>
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
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {hall.capacity}</span>
                    </div>
                    {getStatusBadge(hall.status)}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">{formatAmount(hall.pricePerDay)}/day</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline">{hall.bookings} bookings</Badge>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search bookings..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hall</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.hall}</TableCell>
                    <TableCell>{booking.client}</TableCell>
                    <TableCell>{booking.event}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell className="text-primary font-semibold">{formatAmount(booking.amount)}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
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

export default AdminHalls;
