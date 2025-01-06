import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Martins Poços",
  description: "Create by Natalia Salete",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
