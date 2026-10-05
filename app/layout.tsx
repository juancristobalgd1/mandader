import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${BRAND.name}: lo que quieras, a tu puerta`,
  description: "Pide comida, súper, farmacia o cualquier mandado y te lo llevamos a casa en Elgoibar, Eibar y alrededores.",
};
export const viewport: Viewport = { themeColor: "#14110f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
