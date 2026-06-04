import { NextResponse } from "next/server";
import { deletePlatformMedia, getPlatformMediaBlob } from "@/lib/platform/media-blobs";
import { requirePlatformStaff } from "@/lib/platform/require-platform-staff";

export const runtime = "nodejs";

type RouteContext = { params: { path: string[] } };

function resolveKey(segments: string[]): string {
  return segments.map((s) => decodeURIComponent(s)).join("/");
}

/** Herkese açık görsel servisi (vitrin https URL’leri) */
export async function GET(_request: Request, context: RouteContext) {
  const key = resolveKey(context.params.path ?? []);
  const { data, contentType, error } = await getPlatformMediaBlob(key);

  if (error || !data) {
    return new NextResponse(error ?? "Bulunamadı", { status: 404 });
  }

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePlatformStaff();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const key = resolveKey(context.params.path ?? []);
  const { error } = await deletePlatformMedia(key);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
