import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Futuristic Social Dashboard",
  description:
    "Uma plataforma social futurista com design neon e tecnologia avançada",
  keywords: "social, futuristic, neon, dashboard, posts, cyberpunk",
  authors: [{ name: "Futuristic Dev Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00D2FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {children}
      </body>
    </html>
  );
}
