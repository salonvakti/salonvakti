"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmit: (data: { displayName: string; color: string }) => void;
};

export function StaffForm({ onSubmit }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#6366f1");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ displayName, color });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="staff-name">Görünen ad</Label>
        <Input id="staff-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-color">Takvim rengi</Label>
        <Input id="staff-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <Button type="submit">Personel ekle</Button>
    </form>
  );
}
