"use client";

import { useState, useTransition } from "react";
import { ExternalLink, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveGoogleMapsReviewsAction } from "./actions";
import type { ResolvedPublicSiteSettings } from "@/types/public-site";

type Props = {
  initial: ResolvedPublicSiteSettings["integrations"];
};

export function GoogleReviewsPlatformClient({ initial }: Props) {
  const [mapsUrl, setMapsUrl] = useState(initial.googleMapsUrl ?? "");
  const [placeId, setPlaceId] = useState(initial.googleMapsPlaceId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(initial.googleMapsReviews.length);
  const [fetchedAt, setFetchedAt] = useState(initial.googleMapsReviewsFetchedAt);
  const [pending, startTransition] = useTransition();

  function run(refreshReviews: boolean) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const r = await saveGoogleMapsReviewsAction({
        googleMapsUrl: mapsUrl,
        googleMapsPlaceId: placeId,
        refreshReviews,
      });
      if (r.ok) {
        setReviewCount(r.reviewCount);
        setFetchedAt(new Date().toISOString());
        setMessage(
          refreshReviews
            ? `${r.reviewCount} yorum önbelleğe alındı. Ana sayfada görünür.`
            : "Bağlantı kaydedildi."
        );
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" aria-hidden />
            Google Haritalar yorumları
          </CardTitle>
          <CardDescription>
            İşletmenizin Google Haritalar sayfası bağlantısını girin. Kaydettiğinizde yorumlar Places
            API ile çekilir ve ana sayfadaki referanslar bölümünde kaydırmalı gösterilir (Google en
            fazla 5 yorum döndürür).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gmaps-url">Haritalar bağlantısı</Label>
            <Input
              id="gmaps-url"
              type="url"
              placeholder="https://www.google.com/maps/place/..."
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Google Haritalar → işletmeniz → Paylaş → bağlantıyı kopyalayın.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="place-id">Place ID (isteğe bağlı)</Label>
            <Input
              id="place-id"
              placeholder="ChIJ..."
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Bağlantıdan Place ID çıkarılamazsa buraya yapıştırın.
            </p>
          </div>

          {initial.googleMapsRating != null ? (
            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              Önbellek: <strong>{reviewCount}</strong> yorum
              {initial.googleMapsRating != null ? (
                <>
                  {" "}
                  · Ortalama <strong>{initial.googleMapsRating.toFixed(1)}</strong>
                </>
              ) : null}
              {fetchedAt ? (
                <span className="block text-xs text-muted-foreground mt-1">
                  Son güncelleme: {new Date(fetchedAt).toLocaleString("tr-TR")}
                </span>
              ) : null}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pending} onClick={() => run(true)}>
              <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} data-icon="inline-start" />
              Kaydet ve yorumları çek
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => run(false)}>
              Yalnızca bağlantıyı kaydet
            </Button>
          </div>

          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Haritada önizle
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API anahtarı</CardTitle>
          <CardDescription>
            Sunucuda <code className="text-xs">GOOGLE_PLACES_API_KEY</code> tanımlı olmalı. Google Cloud
            Console’da <strong>Places API</strong> etkinleştirin.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
