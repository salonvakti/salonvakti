import { PlatformSiteLookClient } from "./platform-site-look-client";
import { getPlatformSiteSettingsAdminAction } from "./actions";

export default async function PlatformSiteLookPage() {
  const { settings, error } = await getPlatformSiteSettingsAdminAction();

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Site görünümü</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return <PlatformSiteLookClient initial={settings} />;
}
