import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";
import { absoluteUrl } from "@/lib/seo/site-url";

export const PLATFORM_MEDIA_STORE = "salonvakti-platform-media";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export type PlatformMediaItem = {
  key: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  originalName: string;
};

function getMediaStore() {
  const siteID = process.env.NETLIFY_SITE_ID?.trim() || process.env.SITE_ID?.trim();
  const token = process.env.NETLIFY_AUTH_TOKEN?.trim();

  if (siteID && token) {
    return getStore({
      name: PLATFORM_MEDIA_STORE,
      siteID,
      token,
      consistency: "strong",
    });
  }

  return getStore({
    name: PLATFORM_MEDIA_STORE,
    consistency: "strong",
  });
}

export function isBlobsConfigured(): boolean {
  if (process.env.NETLIFY_SITE_ID || process.env.SITE_ID) {
    return Boolean(process.env.NETLIFY_AUTH_TOKEN);
  }
  return Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT || process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

export function blobsConfigHint(): string {
  return (
    "Netlify Blobs kullanılamıyor. Üretimde Netlify deploy yeterlidir; yerelde `netlify dev` çalıştırın " +
    "veya NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN tanımlayın."
  );
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]/g, "").trim().slice(0, 80);
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return safe || "gorsel";
}

function buildObjectKey(originalName: string): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = randomUUID().slice(0, 8);
  return `uploads/${y}/${m}/${id}-${sanitizeFilename(originalName)}`;
}

export function mediaPublicUrl(key: string): string {
  const encoded = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return absoluteUrl(`/api/platform/media/${encoded}`);
}

function parseMetadata(meta: Record<string, string> | undefined, key: string): PlatformMediaItem {
  const contentType = meta?.contentType ?? "application/octet-stream";
  const size = Number(meta?.size ?? 0);
  const uploadedAt = meta?.uploadedAt ?? "";
  const originalName = meta?.originalName ?? key.split("/").pop() ?? key;

  return {
    key,
    url: mediaPublicUrl(key),
    contentType,
    size: Number.isFinite(size) ? size : 0,
    uploadedAt,
    originalName,
  };
}

export async function listPlatformMedia(): Promise<{
  items: PlatformMediaItem[];
  error: string | null;
}> {
  try {
    const store = getMediaStore();
    const { blobs } = await store.list();
    const items = await Promise.all(
      blobs.map(async (b) => {
        const metaRow = await store.getMetadata(b.key);
        const raw = metaRow?.metadata;
        const meta =
          raw && typeof raw === "object"
            ? (Object.fromEntries(
                Object.entries(raw).map(([k, v]) => [k, String(v)])
              ) as Record<string, string>)
            : undefined;
        return parseMetadata(meta, b.key);
      })
    );
    items.sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));
    return { items, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Liste alınamadı.";
    return { items: [], error: msg.includes("Blobs") ? blobsConfigHint() : msg };
  }
}

export async function uploadPlatformMedia(
  file: File,
  uploadedBy: string
): Promise<{ item: PlatformMediaItem | null; error: string | null }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      item: null,
      error: "Yalnızca JPEG, PNG, WebP, GIF veya SVG yükleyebilirsiniz.",
    };
  }

  if (file.size > MAX_BYTES) {
    return { item: null, error: "Dosya en fazla 5 MB olabilir." };
  }

  const key = buildObjectKey(file.name || "gorsel");
  const uploadedAt = new Date().toISOString();

  try {
    const store = getMediaStore();
    await store.set(key, file, {
      metadata: {
        contentType: file.type,
        size: String(file.size),
        uploadedAt,
        originalName: file.name || key,
        uploadedBy,
      },
    });

    return {
      item: {
        key,
        url: mediaPublicUrl(key),
        contentType: file.type,
        size: file.size,
        uploadedAt,
        originalName: file.name || key,
      },
      error: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yükleme başarısız.";
    return { item: null, error: msg.includes("Blobs") ? blobsConfigHint() : msg };
  }
}

export async function deletePlatformMedia(key: string): Promise<{ error: string | null }> {
  if (!key.startsWith("uploads/")) {
    return { error: "Geçersiz dosya anahtarı." };
  }

  try {
    const store = getMediaStore();
    await store.delete(key);
    return { error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Silinemedi.";
    return { error: msg.includes("Blobs") ? blobsConfigHint() : msg };
  }
}

export async function getPlatformMediaBlob(key: string): Promise<{
  data: ArrayBuffer | null;
  contentType: string;
  error: string | null;
}> {
  if (!key.startsWith("uploads/")) {
    return { data: null, contentType: "application/octet-stream", error: "Geçersiz anahtar." };
  }

  try {
    const store = getMediaStore();
    const meta = await store.getMetadata(key);
    const data = await store.get(key, { type: "arrayBuffer" });
    if (!data) {
      return { data: null, contentType: "application/octet-stream", error: "Dosya bulunamadı." };
    }
    const rawMeta = meta?.metadata;
    const contentType =
      rawMeta && typeof rawMeta === "object" && "contentType" in rawMeta
        ? String((rawMeta as Record<string, unknown>).contentType)
        : "application/octet-stream";
    return { data, contentType, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okunamadı.";
    return { data: null, contentType: "application/octet-stream", error: msg };
  }
}
