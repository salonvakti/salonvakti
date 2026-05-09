/** Randevu akışı kiracı/personel verisinin önbelleğe takılmaması için. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BookingSalonSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
