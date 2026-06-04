import { NextResponse } from "next/server";
import { listPlatformMedia, uploadPlatformMedia } from "@/lib/platform/media-blobs";
import { requirePlatformStaff } from "@/lib/platform/require-platform-staff";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requirePlatformStaff();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { items, error } = await listPlatformMedia();
  if (error) {
    return NextResponse.json({ error, items: [] }, { status: 503 });
  }

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const auth = await requirePlatformStaff();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Dosya alanı (file) gerekli." }, { status: 400 });
  }

  const { item, error } = await uploadPlatformMedia(file, auth.userId);
  if (error || !item) {
    return NextResponse.json({ error: error ?? "Yükleme başarısız." }, { status: 400 });
  }

  return NextResponse.json({ item }, { status: 201 });
}
