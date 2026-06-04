"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import type { PlatformMediaItem } from "@/lib/platform/media-blobs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR");
  } catch {
    return iso;
  }
}

export function PlatformMediaClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PlatformMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/platform/media", { credentials: "include" });
    const body = (await res.json()) as { items?: PlatformMediaItem[]; error?: string };
    if (!res.ok) {
      setItems([]);
      setError(body.error ?? "Liste yüklenemedi.");
      return;
    }
    setItems(body.items ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    let ok = 0;
    const errors: string[] = [];

    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/platform/media", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        errors.push(`${file.name}: ${body.error ?? "Hata"}`);
      } else {
        ok += 1;
      }
    }

    await refresh();
    setUploading(false);

    if (ok > 0) {
      setMessage(`${ok} görsel yüklendi.`);
    }
    if (errors.length > 0) {
      setError(errors.join(" · "));
    }
  }

  async function onDelete(key: string) {
    if (!confirm("Bu görseli kalıcı olarak silmek istiyor musunuz?")) return;

    setDeletingKey(key);
    setError(null);
    const encoded = key.split("/").map((p) => encodeURIComponent(p)).join("/");
    const res = await fetch(`/api/platform/media/${encoded}`, {
      method: "DELETE",
      credentials: "include",
    });
    const body = (await res.json()) as { error?: string };
    setDeletingKey(null);

    if (!res.ok) {
      setError(body.error ?? "Silinemedi.");
      return;
    }
    setMessage("Görsel silindi.");
    await refresh();
  }

  async function copyUrl(url: string, key: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError("Panoya kopyalanamadı.");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void uploadFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" aria-hidden />
            Görsel yükle
          </CardTitle>
          <CardDescription>
            JPEG, PNG, WebP, GIF veya SVG · en fazla 5 MB · Netlify Blobs (
            <code className="rounded bg-muted px-1 text-xs">salonvakti-platform-media</code>)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/40",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden />
            )}
            <p className="text-center text-sm text-muted-foreground">
              Dosyayı sürükleyip bırakın veya tıklayarak seçin
            </p>
            <Button type="button" variant="secondary" size="sm" disabled={uploading}>
              Dosya seç
            </Button>
          </div>
          <Input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files?.length) void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{message}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yüklenen görseller</CardTitle>
          <CardDescription>
            {loading ? "Yükleniyor…" : `${items.length} dosya`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Henüz görsel yok. Yukarıdan ilk yüklemeyi yapın.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="truncate text-sm font-medium" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.size)} · {formatDate(item.uploadedAt)}
                    </p>
                    <div className="flex gap-1">
                      <Input
                        readOnly
                        value={item.url}
                        className="h-8 font-mono text-[0.65rem]"
                        onFocus={(e) => e.target.select()}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        title="URL kopyala"
                        onClick={() => void copyUrl(item.url, item.key)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Yeni sekmede aç"
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        title="Sil"
                        disabled={deletingKey === item.key}
                        onClick={() => void onDelete(item.key)}
                      >
                        {deletingKey === item.key ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    {copiedKey === item.key ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">URL kopyalandı</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
