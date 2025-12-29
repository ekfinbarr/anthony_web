import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreVertical, Eye, Download, TrendingUp, CreditCard, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockDonations = [
  { id: 1, name: "John Adeyemi", email: "john@email.com", amount: 50000, category: "Tithe", status: "completed", date: "2024-01-15", method: "Bank Transfer" },
  { id: 2, name: "Mary Okonkwo", email: "mary@email.com", amount: 25000, category: "Building Fund", status: "completed", date: "2024-01-14", method: "Card" },
  { id: 3, name: "David Eze", email: "david@email.com", amount: 100000, category: "Thanksgiving", status: "pending", date: "2024-01-13", method: "Bank Transfer" },
  { id: 4, name: "Grace Nnamdi", email: "grace@email.com", amount: 15000, category: "Offertory", status: "completed", date: "2024-01-12", method: "Cash" },
  { id: 5, name: "Anonymous", email: "-", amount: 500000, category: "Special Project", status: "completed", date: "2024-01-10", method: "Bank Transfer" },
];

const stats = [
  { title: "Total Donations", value: "₦2,450,000", change: "+18% from last month", icon: CreditCard },
  { title: "This Month", value: "₦690,000", change: "32 donations", icon: Calendar },
  { title: "Donors", value: "156", change: "+12 new donors", icon: Users },
  { title: "Average", value: "₦44,565", change: "Per donation", icon: TrendingUp },
];

const AdminDonations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const filteredDonations = mockDonations.filter(donation => {
    const matchesSearch = donation.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || donation.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatAmount = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const getStatusBadge = (status: string) => {
    return status === "completed" 
      ? <Badge variant="default">Completed</Badge>
      : <Badge variant="outline">Pending</Badge>;
  };

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Your download will start shortly." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Donations Management</h1>
          <p className="text-muted-foreground">Track and manage parish donations.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")}>Export as Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
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
              <Input placeholder="Search donations..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Tithe">Tithe</SelectItem>
                <SelectItem value="Offertory">Offertory</SelectItem>
                <SelectItem value="Building Fund">Building Fund</SelectItem>
                <SelectItem value="Thanksgiving">Thanksgiving</SelectItem>
                <SelectItem value="Special Project">Special Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{donation.name}</p>
                    <p className="text-sm text-muted-foreground">{donation.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">{formatAmount(donation.amount)}</TableCell>
                <TableCell><Badge variant="secondary">{donation.category}</Badge></TableCell>
                <TableCell>{donation.method}</TableCell>
                <TableCell>{getStatusBadge(donation.status)}</TableCell>
                <TableCell className="text-muted-foreground">{donation.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                      <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Download Receipt</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminDonations;
