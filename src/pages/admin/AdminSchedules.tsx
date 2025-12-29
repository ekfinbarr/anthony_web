import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreVertical, Edit, Trash2, Clock, Calendar, Church } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockMassSchedules = [
  { id: 1, day: "Sunday", time: "7:00 AM", type: "Mass", language: "English", celebrant: "Fr. Anthony", status: "active" },
  { id: 2, day: "Sunday", time: "9:00 AM", type: "Mass", language: "English", celebrant: "Fr. Peter", status: "active" },
  { id: 3, day: "Sunday", time: "5:00 PM", type: "Mass", language: "Yoruba", celebrant: "Fr. Anthony", status: "active" },
  { id: 4, day: "Monday - Friday", time: "6:30 AM", type: "Daily Mass", language: "English", celebrant: "Rotating", status: "active" },
  { id: 5, day: "Saturday", time: "4:00 PM", type: "Confession", language: "English/Yoruba", celebrant: "Fr. Peter", status: "active" },
];

const mockSacramentSchedules = [
  { id: 1, sacrament: "Baptism", day: "2nd & 4th Sunday", time: "After 9 AM Mass", requirements: "Registration required", status: "active" },
  { id: 2, sacrament: "First Communion", day: "May (Annual)", time: "9:00 AM", requirements: "Complete catechism classes", status: "upcoming" },
  { id: 3, sacrament: "Confirmation", day: "Pentecost Sunday", time: "10:00 AM", requirements: "Complete confirmation classes", status: "upcoming" },
  { id: 4, sacrament: "Marriage", day: "By appointment", time: "Varies", requirements: "6 months notice required", status: "active" },
  { id: 5, sacrament: "Anointing of the Sick", day: "Available daily", time: "On request", requirements: "Contact parish office", status: "active" },
];

const AdminSchedules = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      upcoming: "outline",
      inactive: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Mass & Sacrament Schedules</h1>
          <p className="text-muted-foreground">Manage church schedules and timings.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Schedule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Schedule</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mass">Mass</SelectItem>
                    <SelectItem value="confession">Confession</SelectItem>
                    <SelectItem value="sacrament">Sacrament</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day(s)</Label>
                  <Input placeholder="e.g., Sunday" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Celebrant/Minister</Label>
                <Input placeholder="e.g., Fr. Anthony" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Schedule added successfully" }); }}>Add Schedule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="mass" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mass" className="gap-2"><Church className="h-4 w-4" /> Mass Schedules</TabsTrigger>
          <TabsTrigger value="sacraments" className="gap-2"><Calendar className="h-4 w-4" /> Sacraments</TabsTrigger>
        </TabsList>

        <TabsContent value="mass" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search schedules..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Celebrant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMassSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.day}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {schedule.time}
                      </div>
                    </TableCell>
                    <TableCell>{schedule.type}</TableCell>
                    <TableCell>{schedule.language}</TableCell>
                    <TableCell>{schedule.celebrant}</TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
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

        <TabsContent value="sacraments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSacramentSchedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{schedule.sacrament}</CardTitle>
                    {getStatusBadge(schedule.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{schedule.day}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.time}</span>
                  </div>
                  <p className="pt-2 border-t text-muted-foreground">{schedule.requirements}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSchedules;
