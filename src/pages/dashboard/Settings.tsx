import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast"; 

const ColorField = ({ label, defaultColor }: { label: string; defaultColor: string }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex items-center gap-2">
      <input type="color" defaultValue={defaultColor} className="h-10 w-14 rounded border border-input cursor-pointer" />
      <Input defaultValue={defaultColor} className="font-mono text-xs" />
    </div>
  </div>
);

const Settings = () => (
  <DashboardLayout title="Settings">
    <form
      onSubmit={(e) => { e.preventDefault(); toast({ title: "Settings saved" }); }}
      className="space-y-6 max-w-4xl"
    >
      <Card>
        <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {["Website Logo", "Favicon"].map((s) => (
            <label key={s} className="border-2 border-dashed border-border hover:border-gold rounded-md p-6 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-gold transition-colors">
              <ImagePlus className="h-6 w-6 mb-1" />
              <span className="text-sm">{s}</span>
              <input type="file" className="hidden" />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Theme Colors</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <ColorField label="Primary (Navy)" defaultColor="#0B1E3F" />
          <ColorField label="Accent (Gold)" defaultColor="#C9A961" />
          <ColorField label="Background" defaultColor="#FAF8F3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">SEO Meta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Meta Title</Label><Input defaultValue="Sterling & Vance — Trusted Legal Solutions" /></div>
          <div className="space-y-2"><Label>Meta Description</Label>
            <Textarea rows={3} defaultValue="Premier law firm specialising in corporate, IP, and tax law. Trusted by enterprises across India." />
          </div>
          <div className="space-y-2"><Label>Keywords (comma separated)</Label>
            <Input defaultValue="law firm, corporate law, IP law, advocate Mumbai" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Admin Profile</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Display Name</Label><Input defaultValue="Site Administrator" /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue="admin@sterlingvance.law" /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Discard</Button>
        <Button type="submit" variant="gold">Save Settings</Button>
      </div>
    </form>
  </DashboardLayout>
);
export default Settings;
