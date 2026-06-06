"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
import { savePlatformKvkkTextAction } from "./actions";
import { DEFAULT_KVKK_TEXT } from "@/lib/platform/kvkk-default-text";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const textareaClass =
  "flex min-h-[420px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function PlatformLegalClient({ initialKvkkText }: { initialKvkkText: string }) {
  const [text, setText] = useState(initialKvkkText);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await savePlatformKvkkTextAction(text);
      if (!res.ok) {
        setError(res.error ?? "Kayıt başarısız.");
        return;
      }
      setMessage("KVKK metni kaydedildi. Müşteri profil sayfasındaki bağlantı güncellendi.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Yasal metinler</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            KVKK aydınlatma ve açık rıza metni müşteri profilinde linklenir.{" "}
            <code className="rounded bg-muted px-1 text-xs">[İşletme Adı/Unvanı]</code> gibi yer tutucuları
            metin içinde bırakabilirsiniz.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/kvkk" target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink className="h-3.5 w-3.5" data-icon="inline-start" />
            Metni önizle
          </Link>
          <Button type="button" size="sm" onClick={() => void save()} disabled={pending}>
            <Save className="h-3.5 w-3.5" data-icon="inline-start" />
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>KVKK aydınlatma ve açık rıza metni</CardTitle>
          <CardDescription>
            Müşteriler profil doldururken bu metne yönlendirilir. Değişiklikler anında{" "}
            <Link href="/kvkk" className="text-primary underline-offset-2 hover:underline">
              /kvkk
            </Link>{" "}
            sayfasına yansır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="kvkk-text">Metin</Label>
          <textarea
            id="kvkk-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={pending}
            className={textareaClass}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setText(DEFAULT_KVKK_TEXT)}
            >
              <RotateCcw className="h-3.5 w-3.5" data-icon="inline-start" />
              Varsayılana sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
