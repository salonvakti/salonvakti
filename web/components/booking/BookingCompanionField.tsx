"use client";

import {
  APPOINTMENT_COMPANION_LABELS,
  APPOINTMENT_COMPANION_TYPES,
  type AppointmentCompanionType,
} from "@/lib/booking/companion";
import { cn } from "@/lib/utils";

type Props = {
  value: AppointmentCompanionType | "";
  onChange: (value: AppointmentCompanionType | "") => void;
};

export function BookingCompanionField({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <legend className="px-1 text-sm font-medium">
        Yanınızda size eşlik edecek misafir
        <span className="ml-1 font-normal text-muted-foreground">(isteğe bağlı)</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            value === "" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
          )}
        >
          <input
            type="radio"
            name="companion"
            className="h-4 w-4 accent-primary"
            checked={value === ""}
            onChange={() => onChange("")}
          />
          Kimse yok
        </label>
        {APPOINTMENT_COMPANION_TYPES.map((type) => (
          <label
            key={type}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              value === type ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            )}
          >
            <input
              type="radio"
              name="companion"
              className="h-4 w-4 accent-primary"
              checked={value === type}
              onChange={() => onChange(type)}
            />
            {APPOINTMENT_COMPANION_LABELS[type]}
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Bu seçenek yalnızca kayıtlı müşteri hesabınızla randevu oluştururken kullanılabilir.
      </p>
    </fieldset>
  );
}
