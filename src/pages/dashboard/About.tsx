import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const About = () => (
  <DashboardLayout title="About Us Management">
    <form
      onSubmit={(e) => { e.preventDefault(); toast({ title: "Saved", description: "About page updated." }); }}
      className="space-y-6 max-w-4xl"
    >
      <Card>
        <CardHeader><CardTitle className="text-base">Firm Description</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input defaultValue="Trusted Legal Solutions for a Modern World" />
          </div>
          <div className="space-y-2">
            <Label>About Description</Label>
            <Textarea rows={5} defaultValue="Sterling & Vance is a full-service law firm with over three decades of experience advising leading enterprises and individuals on complex legal matters." />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {["Mission", "Vision", "USP"].map((label) => (
          <Card key={label}>
            <CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={5} placeholder={`Enter ${label.toLowerCase()}…`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Hero & Gallery Images</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <label key={i} className="aspect-square rounded-md border-2 border-dashed border-border hover:border-gold flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-gold transition-colors">
                <ImagePlus className="h-6 w-6 mb-1" />
                <span className="text-xs">Upload</span>
                <input type="file" className="hidden" />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Discard</Button>
        <Button type="submit" variant="gold">Save Changes</Button>
      </div>
    </form>
  </DashboardLayout>
);
export default About;
