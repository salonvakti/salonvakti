import { GoogleReviewsPlatformClient } from "./google-reviews-client";
import { getGoogleReviewsSettingsAction } from "./actions";

export default async function PlatformGoogleReviewsPage() {
  const { settings, error } = await getGoogleReviewsSettingsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Haritalar yorumları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ana sayfa referanslar bölümünde gösterilecek yorumları buradan yönetin.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <GoogleReviewsPlatformClient initial={settings.integrations} />
    </div>
  );
}
