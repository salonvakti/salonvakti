import "server-only";

import type { GoogleMapsReview } from "@/types/public-site";

const PLACE_ID_RE =
  /^(ChIJ[A-Za-z0-9_-]+|0x[0-9a-fA-F]+:0x[0-9a-fA-F]+|[A-Za-z0-9_-]{10,})$/;

type PlacesDetailsResult = {
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: Array<{
    author_name?: string;
    rating?: number;
    text?: string;
    relative_time_description?: string;
    profile_photo_url?: string;
    time?: number;
  }>;
};

export function extractPlaceIdFromGoogleMapsUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (PLACE_ID_RE.test(trimmed) && trimmed.startsWith("ChIJ")) return trimmed;

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const q = parsed.searchParams.get("q");
    if (q?.startsWith("place_id:")) {
      const id = q.slice("place_id:".length).trim();
      if (id) return id;
    }
    const placeId = parsed.searchParams.get("place_id");
    if (placeId?.trim()) return placeId.trim();
  } catch {
    /* fall through to regex */
  }

  const chij = trimmed.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  if (chij?.[1]) return chij[1];

  const hex = trimmed.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);
  if (hex?.[1]) return hex[1];

  const param = trimmed.match(/[?&]place_id=([^&]+)/);
  if (param?.[1]) return decodeURIComponent(param[1]);

  if (PLACE_ID_RE.test(trimmed)) return trimmed;

  return null;
}

export async function resolveGoogleMapsUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  if (!/goo\.gl|maps\.app\.goo\.gl/i.test(normalized)) return normalized;

  try {
    const res = await fetch(normalized, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    return res.url || normalized;
  } catch {
    return normalized;
  }
}

function normalizeReview(r: NonNullable<PlacesDetailsResult["reviews"]>[number]): GoogleMapsReview | null {
  const text = r.text?.trim();
  if (!text) return null;
  return {
    authorName: r.author_name?.trim() || "Google kullanıcısı",
    rating: typeof r.rating === "number" ? Math.min(5, Math.max(1, r.rating)) : 5,
    text,
    relativeTime: r.relative_time_description?.trim() || "",
    profilePhotoUrl: r.profile_photo_url?.trim() || null,
  };
}

export type FetchPlaceReviewsResult = {
  placeId: string;
  placeName: string | null;
  rating: number | null;
  reviewCount: number | null;
  reviews: GoogleMapsReview[];
};

export async function fetchGooglePlaceReviews(placeId: string): Promise<FetchPlaceReviewsResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY tanımlı değil. Google Cloud Console’da Places API etkinleştirip .env dosyasına ekleyin."
    );
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,user_ratings_total,reviews",
    language: "tr",
    reviews_sort: "newest",
    key: apiKey,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
    { next: { revalidate: 0 } }
  );

  if (!res.ok) {
    throw new Error(`Google Places API HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    result?: PlacesDetailsResult;
  };

  if (data.status !== "OK" || !data.result) {
    throw new Error(data.error_message || data.status || "Place Details alınamadı");
  }

  const reviews = (data.result.reviews ?? [])
    .map(normalizeReview)
    .filter((r): r is GoogleMapsReview => r !== null)
    .sort((a, b) => {
      const ta = a.relativeTime;
      const tb = b.relativeTime;
      return tb.localeCompare(ta);
    });

  return {
    placeId,
    placeName: data.result.name?.trim() || null,
    rating: typeof data.result.rating === "number" ? data.result.rating : null,
    reviewCount:
      typeof data.result.user_ratings_total === "number" ? data.result.user_ratings_total : null,
    reviews,
  };
}

export async function fetchReviewsFromGoogleMapsInput(
  mapsUrl: string,
  explicitPlaceId?: string | null
): Promise<FetchPlaceReviewsResult> {
  const placeIdFromField = explicitPlaceId?.trim();
  if (placeIdFromField) {
    return fetchGooglePlaceReviews(placeIdFromField);
  }

  const resolved = await resolveGoogleMapsUrl(mapsUrl);
  const placeId = extractPlaceIdFromGoogleMapsUrl(resolved);
  if (!placeId) {
    throw new Error(
      "Place ID çıkarılamadı. Google Haritalar’da Paylaş → bağlantıyı kopyalayın veya Place ID alanını doldurun."
    );
  }

  return fetchGooglePlaceReviews(placeId);
}
