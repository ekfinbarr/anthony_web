import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreVertical, Eye, Trash2, Mail, Check, MailOpen, Reply, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockMessages = [
  { id: 1, name: "John Adeyemi", email: "john@email.com", phone: "+234 801 234 5678", subject: "Mass Time Inquiry", message: "Hello, I would like to know the mass times for weekdays. Thank you.", status: "unread", date: "2024-01-15 10:30 AM" },
  { id: 2, name: "Mary Okonkwo", email: "mary@email.com", phone: "+234 802 345 6789", subject: "Wedding Booking", message: "Good day, my fiancé and I would like to book our wedding for June 2024. Please advise on the process.", status: "read", date: "2024-01-14 3:45 PM" },
  { id: 3, name: "David Eze", email: "david@email.com", phone: "+234 803 456 7890", subject: "Volunteering", message: "I am interested in volunteering at the parish. How can I get involved?", status: "unread", date: "2024-01-14 9:15 AM" },
  { id: 4, name: "Grace Nnamdi", email: "grace@email.com", phone: "+234 804 567 8901", subject: "Baptism Certificate", message: "I need a copy of my baptism certificate for confirmation. How do I obtain this?", status: "replied", date: "2024-01-13 2:00 PM" },
  { id: 5, name: "Peter Adesanya", email: "peter@email.com", phone: "+234 805 678 9012", subject: "Prayer Request", message: "Please pray for my mother who is in the hospital. God bless you.", status: "read", date: "2024-01-12 11:20 AM" },
];

const stats = [
  { title: "Total Messages", value: "156", change: "+12 this week" },
  { title: "Unread", value: "23", change: "Needs attention" },
  { title: "Replied", value: "89", change: "57% response rate" },
];

const AdminContact = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);
  const { toast } = useToast();

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchQuery.toLowerCase()) || message.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Mail }> = {
      unread: { variant: "destructive", icon: Mail },
      read: { variant: "secondary", icon: MailOpen },
      replied: { variant: "default", icon: Reply },
    };
    const { variant, icon: Icon } = config[status] || config.read;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const handleAction = (action: string, id: number) => {
    toast({ title: `Message ${action}`, description: `Message #${id} has been ${action.toLowerCase()}.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Contact Messages</h1>
        <p className="text-muted-foreground">View and respond to messages from website visitors.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.map((message) => (
              <TableRow key={message.id} className={message.status === "unread" ? "bg-muted/50" : ""}>
                <TableCell>
                  <div>
                    <p className="font-medium">{message.name}</p>
                    <p className="text-sm text-muted-foreground">{message.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className={message.status === "unread" ? "font-semibold" : ""}>{message.subject}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">{message.message}</p>
                </TableCell>
                <TableCell>{getStatusBadge(message.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{message.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedMessage(message)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Marked as read", message.id)}><Check className="mr-2 h-4 w-4" />Mark as Read</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Reply sent", message.id)}><Reply className="mr-2 h-4 w-4" />Reply</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Deleted", message.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedMessage?.subject}</DialogTitle></DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {selectedMessage.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                  </div>
                </div>
                {getStatusBadge(selectedMessage.status)}
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {selectedMessage.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {selectedMessage.date}
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 gap-2"><Reply className="h-4 w-4" /> Reply</Button>
                <Button variant="outline" onClick={() => { handleAction("Marked as read", selectedMessage.id); setSelectedMessage(null); }}>
                  <Check className="h-4 w-4 mr-2" /> Mark as Read
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContact;
