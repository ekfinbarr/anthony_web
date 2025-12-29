import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, QrCode, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const mockBookings = [
  { id: 1, sacrament: "Baptism", date: "2024-02-15", time: "10:00 AM", status: "confirmed", qrCode: "SAC-BAP-001" },
  { id: 2, sacrament: "First Communion", date: "2024-05-12", time: "9:00 AM", status: "pending", qrCode: "SAC-COM-002" },
];

const sacraments = ["Baptism", "Confirmation", "First Communion", "Reconciliation", "Anointing of the Sick", "Marriage"];

const SacramentsPage = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    return status === "confirmed" ? <Badge variant="default">Confirmed</Badge> : <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Sacraments</h1>
          <p className="text-muted-foreground">Book and manage your sacrament appointments.</p>
        </div>
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Book Sacrament</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Book a Sacrament</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Sacrament Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select sacrament" /></SelectTrigger>
                  <SelectContent>
                    {sacraments.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Preferred Date</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Preferred Time</Label><Input type="time" /></div>
              </div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="Your phone number" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsBookingOpen(false); toast({ title: "Booking submitted", description: "You will be contacted for confirmation." }); }}>Submit Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{booking.sacrament}</CardTitle>
                {getStatusBadge(booking.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /><span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /><span>{booking.time}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setSelectedBooking(booking)}>
                  <QrCode className="h-4 w-4" /> View QR
                </Button>
                <Button variant="outline" size="sm" className="text-destructive"><X className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Booking QR Code</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col items-center py-4">
              <QRCodeSVG value={selectedBooking.qrCode} size={200} />
              <p className="mt-4 font-mono text-sm">{selectedBooking.qrCode}</p>
              <p className="text-sm text-muted-foreground mt-2">Show this code for verification</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SacramentsPage;
