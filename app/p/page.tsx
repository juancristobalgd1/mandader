import { Suspense } from "react";
import ProductoVivo from "@/components/ProductoVivo";
export const metadata = { title: "Producto" };
export default function Page() { return <Suspense><ProductoVivo /></Suspense>; }
