import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Share2, Plus, Trash2, User, Users, Church, IdCard } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

const ParishCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newMember, setNewMember] = useState({ name: "", relationship: "" });

  const parishCardData = {
    id: `SACG-${user?.id?.slice(-8).toUpperCase() || "00000000"}`,
    name: user?.name || "Parishioner",
    email: user?.email || "",
    phone: user?.phone || "",
    memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
  };

  const qrValue = JSON.stringify({
    id: parishCardData.id,
    name: parishCardData.name,
    parish: "St. Anthony Catholic Church, Gbaja",
    verified: true,
  });

  const addFamilyMember = () => {
    if (!newMember.name || !newMember.relationship) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setFamilyMembers([...familyMembers, { ...newMember, id: Date.now().toString() }]);
    setNewMember({ name: "", relationship: "" });
    toast({ title: "Family member added" });
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const handleDownload = async () => {
    toast({ title: "Downloading...", description: "Your parish card PDF is being generated." });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async (platform: string) => {
    const text = `My Parish Card from St. Anthony Catholic Church, Gbaja. ID: ${parishCardData.id}`;
    const url = window.location.href;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    }
    toast({ title: "Sharing...", description: `Opening ${platform}` });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Parish Card</h1>
        <p className="text-muted-foreground">Your digital identification card</p>
      </div>

      {/* Parish Card Preview */}
      <Card className="overflow-hidden">
        <div ref={cardRef} className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-secondary-foreground p-6 print:p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-church flex items-center justify-center">
                  <Church className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-heading font-bold">St. Anthony Catholic Church</h2>
                  <p className="text-sm opacity-80">Gbaja, Lagos</p>
                </div>
              </div>

              <div className="bg-background/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-primary" />
                  <span className="text-sm opacity-80">Card ID:</span>
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {parishCardData.id}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold">{parishCardData.name}</h3>
                <p className="text-sm opacity-80">{parishCardData.email}</p>
                {parishCardData.phone && <p className="text-sm opacity-80">{parishCardData.phone}</p>}
                <p className="text-xs opacity-60">Member since {parishCardData.memberSince}</p>
              </div>

              {familyMembers.length > 0 && (
                <div className="bg-background/10 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Family Members
                  </p>
                  <div className="space-y-1">
                    {familyMembers.map((member) => (
                      <p key={member.id} className="text-sm opacity-80">
                        {member.name} ({member.relationship})
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG value={qrValue} size={120} level="H" />
              </div>
              <p className="text-xs opacity-60 mt-2 text-center">Scan to verify</p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 bg-muted print:hidden">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button onClick={() => handleShare("whatsapp")} variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
            <Button onClick={() => handleShare("facebook")} variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" /> Facebook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Family Members
          </CardTitle>
          <CardDescription>Add family members to your parish card (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <Input
              placeholder="Relationship (e.g., Spouse, Child)"
              value={newMember.relationship}
              onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
            />
            <Button onClick={addFamilyMember} variant="church">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          {familyMembers.length > 0 && (
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{member.name}</span>
                    <Badge variant="secondary">{member.relationship}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFamilyMember(member.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParishCard;
