import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prospection Mail",
  description: "Envoi d'emails automatique avec templates via Gmail",
};

const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem('theme');
  var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="h-dvh overflow-hidden bg-background text-foreground">
        <div className="flex h-full">
          <aside className="flex h-full w-64 shrink-0 flex-col justify-between border-r border-border bg-surface p-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="font-semibold text-foreground">Todo Mail</span>
              </div>
              <NavLinks />
            </div>
            <ThemeToggle />
          </aside>
          <main className="h-full flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
