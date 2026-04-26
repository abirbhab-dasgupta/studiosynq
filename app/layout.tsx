import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/landing/theme-provider";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Studiosynq — AI-Powered Co-Working",
  description:
    "One room where AI handles the tedious parts. Five specialized AI agents for developers, designers, and writers — built right into your workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
  try {
    const t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.add('light');
  } catch(e) {}
` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}