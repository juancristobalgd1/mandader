import { Suspense } from "react";
import OrderView from "@/components/OrderView";
export const metadata = { title: "Tu pedido" };
export default function Page() { return <Suspense><OrderView /></Suspense>; }
