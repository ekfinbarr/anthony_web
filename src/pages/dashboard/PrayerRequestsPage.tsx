import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Heart, Calendar, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockRequests = [
  { id: 1, title: "Prayer for healing", request: "Please pray for my mother who is undergoing surgery.", status: "active", date: "2024-01-15" },
  { id: 2, title: "Job search", request: "Pray that I find a good job this year.", status: "active", date: "2024-01-10" },
  { id: 3, title: "Family reconciliation", request: "Prayer for peace and unity in my family.", status: "completed", date: "2024-01-05" },
];

const PrayerRequestsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Prayer Requests</h1>
          <p className="text-muted-foreground">Submit your prayer intentions to the parish.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Prayer Request</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Title</Label><Input placeholder="Brief title for your request" /></div>
              <div className="space-y-2"><Label>Prayer Request</Label><Textarea placeholder="Share your prayer intention..." rows={4} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsOpen(false); toast({ title: "Prayer request submitted", description: "The parish will pray for your intention." }); }}>Submit</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                </div>
                <Badge variant={request.status === "active" ? "default" : "secondary"}>{request.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{request.request}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /><span>{request.date}</span>
                </div>
                {request.status === "active" && (
                  <Button variant="ghost" size="sm" className="text-destructive h-8"><X className="h-4 w-4 mr-1" /> Cancel</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrayerRequestsPage;
