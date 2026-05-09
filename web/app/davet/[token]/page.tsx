import { DavetClient } from "./davet-client";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: { token: string } };

export default async function DavetPage({ params }: Props) {
  const token = decodeURIComponent(params.token).trim();

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-destructive">
        Sunucu yapılandırması eksik.
      </div>
    );
  }

  const { data: clientRow } = await admin
    .from("clients")
    .select("name,invite_expires_at,tenant_id,user_id")
    .eq("invite_token", token)
    .maybeSingle();

  if (!clientRow) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted-foreground">
        Davet bulunamadı veya iptal edilmiş.
      </div>
    );
  }

  const { data: tenant } = await admin
    .from("tenants")
    .select("name")
    .eq("id", clientRow.tenant_id as string)
    .maybeSingle();

  const exp = clientRow.invite_expires_at as string | null;
  const expired = Boolean(exp && new Date(exp).getTime() < Date.now());
  const alreadyLinked = Boolean(clientRow.user_id);

  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <DavetClient
      token={token}
      tenantName={(tenant?.name as string | undefined) ?? ""}
      clientName={clientRow.name as string}
      expired={expired}
      alreadyLinked={alreadyLinked}
      isLoggedIn={Boolean(user)}
    />
  );
}
