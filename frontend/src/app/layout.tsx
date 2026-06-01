import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolão AD Promotora",
  description: "Acompanhe seus palpites com a AD Promotora",
  icons: {
    icon: "https://adpromotora.com.br/src/img/logos/AD.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
