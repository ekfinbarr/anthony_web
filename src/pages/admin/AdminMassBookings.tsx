import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreVertical, Eye, Edit, Trash2, Check, X, Grid, List, Calendar, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockBookings = [
  { id: 1, name: "John Adeyemi", email: "john@email.com", phone: "+234 801 234 5678", date: "2024-01-20", time: "7:00 AM", intention: "Thanksgiving", status: "pending" },
  { id: 2, name: "Mary Okonkwo", email: "mary@email.com", phone: "+234 802 345 6789", date: "2024-01-21", time: "9:00 AM", intention: "For the sick", status: "approved" },
  { id: 3, name: "David Eze", email: "david@email.com", phone: "+234 803 456 7890", date: "2024-01-22", time: "6:30 AM", intention: "Deceased family", status: "approved" },
  { id: 4, name: "Grace Nnamdi", email: "grace@email.com", phone: "+234 804 567 8901", date: "2024-01-23", time: "7:00 AM", intention: "Birthday blessing", status: "pending" },
  { id: 5, name: "Peter Adesanya", email: "peter@email.com", phone: "+234 805 678 9012", date: "2024-01-24", time: "9:00 AM", intention: "Wedding anniversary", status: "rejected" },
];

const AdminMassBookings = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const { toast } = useToast();

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.name.toLowerCase().includes(searchQuery.toLowerCase()) || booking.intention.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "outline",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleAction = (action: string, id: number) => {
    toast({ title: `Booking ${action}`, description: `Mass booking #${id} has been ${action.toLowerCase()}.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Mass Bookings</h1>
          <p className="text-muted-foreground">Manage mass intention requests from parishioners.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bookings..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Intention</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{booking.email}</p>
                      <p className="text-muted-foreground">{booking.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.date} at {booking.time}</TableCell>
                  <TableCell>{booking.intention}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedBooking(booking)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Approved", booking.id)}><Check className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Rejected", booking.id)}><X className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Deleted", booking.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{booking.name}</h3>
                    <p className="text-sm text-muted-foreground">{booking.email}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{booking.time}</span>
                  </div>
                  <p className="pt-2 border-t"><strong>Intention:</strong> {booking.intention}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAction("Approved", booking.id)}>Approve</Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}><Eye className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedBooking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedBooking.time}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intention</p>
                <p className="font-medium">{selectedBooking.intention}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => { handleAction("Approved", selectedBooking.id); setSelectedBooking(null); }}>Approve</Button>
                <Button variant="destructive" onClick={() => { handleAction("Rejected", selectedBooking.id); setSelectedBooking(null); }}>Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMassBookings;
