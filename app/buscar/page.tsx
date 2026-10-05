import { Suspense } from "react";
import SearchView from "@/components/SearchView";
export const metadata = { title: "Buscar productos" };
export default function Page() { return <Suspense><SearchView /></Suspense>; }
