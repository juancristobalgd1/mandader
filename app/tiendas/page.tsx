import StoreCard from "@/components/StoreCard";
import { TIENDAS } from "@/lib/data";
export const metadata = { title: "Tiendas" };
export default function Page() {
  return <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6"><h1 className="h-section">Tiendas</h1><div className="mt-4 flex flex-wrap gap-3">{TIENDAS.map((t) => <StoreCard key={t.id} t={t} />)}</div></div>;
}
