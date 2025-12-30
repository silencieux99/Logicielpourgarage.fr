import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GaragePro - Logiciel de gestion pour garage automobile",
  description: "Gérez votre garage automobile simplement : clients, véhicules, réparations, devis et factures. Solution complète pour professionnels de l'automobile.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  keywords: "logiciel garage, gestion garage, facturation garage, devis garage automobile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
