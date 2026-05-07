"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  slots: string[];
  selected: string | null;
  onSelect: (time: string) => void;
};

/** Basit slot seçici; gerçek slotlar Supabase + çalışma saatlerinden üretilecek. */
export function TimeSlotPicker({ slots, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((t) => (
        <Button
          key={t}
          type="button"
          variant={selected === t ? "default" : "outline"}
          size="sm"
          className={cn(
            "min-w-[4.5rem]",
            selected === t && "shadow-sm"
          )}
          onClick={() => onSelect(t)}
        >
          {t}
        </Button>
      ))}
    </div>
  );
}
