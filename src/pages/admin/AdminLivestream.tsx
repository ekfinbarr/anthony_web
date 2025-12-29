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
import { Plus, Search, Radio, Play, Eye, Edit, Trash2, Calendar, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockChannels = [
  { id: 1, name: "Main Church Channel", status: "live", viewers: 245, category: "Liturgy", lastStream: "Now" },
  { id: 2, name: "Youth Ministry", status: "offline", viewers: 0, category: "Youth", lastStream: "2 days ago" },
  { id: 3, name: "Choir Channel", status: "scheduled", viewers: 0, category: "Music", lastStream: "1 week ago" },
];

const mockHistory = [
  { id: 1, title: "Sunday Mass - Jan 14", channel: "Main Church Channel", duration: "1h 30m", views: 1250, date: "2024-01-14" },
  { id: 2, title: "Evening Devotion", channel: "Main Church Channel", duration: "45m", views: 456, date: "2024-01-13" },
  { id: 3, title: "Youth Praise Night", channel: "Youth Ministry", duration: "2h 15m", views: 325, date: "2024-01-12" },
  { id: 4, title: "Weekday Mass", channel: "Main Church Channel", duration: "40m", views: 189, date: "2024-01-11" },
];

const AdminLivestream = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    if (status === "live") return <Badge className="bg-red-500 text-white animate-pulse">● LIVE</Badge>;
    if (status === "scheduled") return <Badge variant="outline">Scheduled</Badge>;
    return <Badge variant="secondary">Offline</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Live Streaming</h1>
          <p className="text-muted-foreground">Manage livestream channels and view history.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Channel</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Livestream Channel</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input placeholder="Enter channel name" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liturgy">Liturgy</SelectItem>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Channel description..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsCreateOpen(false); toast({ title: "Channel created successfully" }); }}>Create Channel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels" className="gap-2"><Radio className="h-4 w-4" /> Channels</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><Clock className="h-4 w-4" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockChannels.map((channel) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{channel.category}</p>
                    </div>
                    {getStatusBadge(channel.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {channel.status === "live" && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{channel.viewers} watching</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Last stream: {channel.lastStream}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {channel.status === "live" ? (
                      <Button className="flex-1 gap-2"><Eye className="h-4 w-4" /> Watch</Button>
                    ) : (
                      <Button variant="outline" className="flex-1 gap-2"><Play className="h-4 w-4" /> Go Live</Button>
                    )}
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search streams..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">{stream.title}</TableCell>
                    <TableCell>{stream.channel}</TableCell>
                    <TableCell>{stream.duration}</TableCell>
                    <TableCell>{stream.views}</TableCell>
                    <TableCell>{stream.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default AdminLivestream;
