import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "NokePoints — Mirá el stream, sumá puntos",
  description:
    "Ganá puntos mientras mirás los streams de soynokexd en Kick. Canjealos por premios y participá en la comunidad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-noke-dark text-white font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
