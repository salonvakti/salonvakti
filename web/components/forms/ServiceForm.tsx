"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmit: (data: {
    name: string;
    durationMinutes: number;
    price: number;
    description: string;
  }) => Promise<boolean> | boolean;
  disabled?: boolean;
  submitting?: boolean;
};

export function ServiceForm({ onSubmit, disabled = false, submitting = false }: Props) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await onSubmit({
          name,
          durationMinutes: duration,
          price,
          description,
        });
        if (!ok) return;
        setName("");
        setDuration(30);
        setPrice(0);
        setDescription("");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="svc-name">Hizmet adı</Label>
        <Input
          id="svc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled || submitting}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="svc-duration">Süre (dk)</Label>
          <Input
            id="svc-duration"
            type="number"
            min={5}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={disabled || submitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="svc-price">Fiyat (TRY)</Label>
          <Input
            id="svc-price"
            type="number"
            min={0}
            step={10}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            disabled={disabled || submitting}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="svc-desc">Açıklama</Label>
        <Input
          id="svc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled || submitting}
        />
      </div>
      <Button type="submit" disabled={disabled || submitting}>
        {submitting ? "Kaydediliyor..." : "Hizmeti ekle"}
      </Button>
    </form>
  );
}
