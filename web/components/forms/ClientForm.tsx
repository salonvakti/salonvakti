"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmit: (data: { name: string; phone: string; email: string; note: string }) => void;
};

export function ClientForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, phone, email, note });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="client-name">Ad soyad</Label>
        <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-phone">Telefon</Label>
        <Input id="client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-email">E-posta</Label>
        <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-note">Not</Label>
        <Input id="client-note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button type="submit">Kaydet</Button>
    </form>
  );
}
