import { redirect } from "next/navigation";

/** Eski bağlantılar için; profil düzenleme tek yerde `/account`. */
export default function ClientMyProfileRedirectPage() {
  redirect("/account");
}
