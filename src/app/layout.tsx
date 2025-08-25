import "./globals.css";
import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { SidebarSaved } from "@/components/SidebarSaved";

export const metadata: Metadata = {
  title: "colortheme.co — Curated Color Palettes",
  description:
    "Explore trending, popular, and curated color palettes with HEX, RGB, HSL, and more. Save favorites instantly.",
  metadataBase: new URL("https://colortheme.co"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {/* Theme init to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const k='colortheme:theme'; const s=localStorage.getItem(k); const prefers=window.matchMedia('(prefers-color-scheme: dark)').matches; const t=(s==='dark'||s==='light')?s:(prefers?'dark':'light'); const root=document.documentElement; root.classList.toggle('dark', t==='dark'); document.documentElement.style.colorScheme = t; } catch {} })();`,
          }}
        />

        <HeaderNav />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section>{children}</section>
          <aside className="hidden lg:block sticky top-4 h-fit">
            <SidebarSaved />
          </aside>
        </main>
      </body>
    </html>
  );
}
