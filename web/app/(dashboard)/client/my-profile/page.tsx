import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientMyProfilePage() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Müşteri ve onaylı müşteri için temel iletişim bilgileri.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nm">Ad soyad</Label>
          <Input id="nm" defaultValue="Demo Müşteri" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tel">Telefon</Label>
          <Input id="tel" type="tel" defaultValue="+90 555 000 11 22" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Kaydet</Button>
      </CardFooter>
    </Card>
  );
}
