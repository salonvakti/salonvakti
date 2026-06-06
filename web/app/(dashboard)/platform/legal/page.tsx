import { PlatformLegalClient } from "./platform-legal-client";
import { getPlatformLegalSettingsAction } from "./actions";

export default async function PlatformLegalPage() {
  const { kvkkText, error } = await getPlatformLegalSettingsAction();

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Yasal metinler</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return <PlatformLegalClient initialKvkkText={kvkkText} />;
}
