import TiendasView from "@/components/TiendasView";
export const metadata = { title: "Tiendas" };
export default function Page() {
  return <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6"><h1 className="h-section">Tiendas</h1><TiendasView /></div>;
}
