import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Calendar, Eye, Trash2 } from "lucide-react";

const mockAnnouncements = [
  { id: 1, title: "Lenten Season Schedule", content: "The Lenten season begins on Ash Wednesday, February 14th. Daily masses will be at 6:30 AM and 6:00 PM.", date: "2024-01-20", read: false, priority: "high" },
  { id: 2, title: "Parish Council Meeting", content: "All parish council members are reminded of the monthly meeting scheduled for January 25th at 5:00 PM.", date: "2024-01-18", read: true, priority: "normal" },
  { id: 3, title: "Youth Group Retreat", content: "The youth group retreat will hold from February 15-17 at the diocesan retreat center. Registration is now open.", date: "2024-01-15", read: true, priority: "normal" },
  { id: 4, title: "Building Fund Update", content: "We are pleased to announce that we have reached 75% of our building fund target. Thank you for your generous contributions.", date: "2024-01-10", read: true, priority: "normal" },
];

const AnnouncementsPage = () => {
  const getPriorityBadge = (priority: string, read: boolean) => {
    if (!read) return <Badge variant="destructive">New</Badge>;
    if (priority === "high") return <Badge variant="default">Important</Badge>;
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with parish news and announcements.</p>
      </div>

      <div className="space-y-4">
        {mockAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={`hover:shadow-lg transition-shadow ${!announcement.read ? "border-primary/50 bg-primary/5" : ""}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </div>
                {getPriorityBadge(announcement.priority, announcement.read)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{announcement.content}</p>
              <div className="flex gap-2">
                {!announcement.read && (
                  <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4" /> Mark as Read</Button>
                )}
                <Button variant="ghost" size="sm" className="text-destructive gap-1"><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
