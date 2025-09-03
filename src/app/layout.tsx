import "./globals.css";
import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";

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
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased">
        {/* Theme init to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { 
  // legacy dark/light toggle support
  const kTheme='colortheme:theme';
  const savedTheme=localStorage.getItem(kTheme);
  const prefers=window.matchMedia('(prefers-color-scheme: dark)').matches; 
  const t=(savedTheme==='dark'||savedTheme==='light')?savedTheme:(prefers?'dark':'light'); 
  const root=document.documentElement; 
  root.classList.toggle('dark', t==='dark'); 
  document.documentElement.style.colorScheme = t; 

  // dynamic palette theme support
  const kPal='palettehub:activeTheme';
  const raw=localStorage.getItem(kPal);
  if (raw) { try { 
    const parsed = JSON.parse(raw);
    const cols = Array.isArray(parsed?.colors) ? parsed.colors.slice(0,8) : [];
    const mode = parsed?.mode === 'full' ? 'full' : 'accent';
    if (cols.length) {
      const toRGB=(h)=>{h=String(h||'').replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
      const lum=(h)=>{const [r,g,b]=toRGB(h);const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};const [R,G,B]=[f(r),f(g),f(b)];return 0.2126*R+0.7152*G+0.0722*B};
      const contrast=(bg)=> lum(bg)>0.6 ? '#0b0b0b' : '#fafafa';
      const mix=(a,b,t)=>{const ar=toRGB(a), br=toRGB(b); const m=(x,y)=>Math.round(x*(1-t)+y*t); const h=(n)=>n.toString(16).padStart(2,'0'); return '#'+h(m(ar[0],br[0]))+h(m(ar[1],br[1]))+h(m(ar[2],br[2]))};
      const sorted=[...cols].sort((a,b)=>lum(b)-lum(a));
      const lightest = sorted[0] || cols[0];
      const darkest = [...cols].sort((a,b)=>lum(a)-lum(b))[0] || cols[0];
      const background = lightest;
      const foreground = contrast(background);
      const accent = cols[Math.min(2, cols.length-1)];
      const border = mix(background, foreground, 0.15);
      root.style.setProperty('--accent', accent);
      root.style.setProperty('--accent-contrast', contrast(accent));
      cols.forEach((c,i)=> root.style.setProperty('--palette-'+(i+1), c));
      if (mode === 'full') {
        root.style.setProperty('--background', background);
        root.style.setProperty('--foreground', foreground);
        root.style.setProperty('--surface', background);
        root.style.setProperty('--border', border);
        root.style.setProperty('--muted', mix(background, darkest, 0.75));
        document.documentElement.style.colorScheme = lum(background) > 0.6 ? 'light' : 'dark';
        root.setAttribute('data-theme-active','true');
      } else {
        root.setAttribute('data-theme-active','accent');
      }
    }
  } catch {}
  }
} catch {} })();`,
          }}
        />

        <HeaderNav />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
