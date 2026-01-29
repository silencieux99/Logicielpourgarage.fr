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
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var root=document.documentElement;var stored=localStorage.getItem('theme');var theme=stored|| (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');root.dataset.theme=theme;if(theme==='dark'){root.classList.add('dark')}else{root.classList.remove('dark')}var accent=localStorage.getItem('accentColor');if(accent){root.style.setProperty('--accent-primary',accent);try{var c=accent.replace('#','');if(c.length===3){c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2]}var r=parseInt(c.slice(0,2),16),g=parseInt(c.slice(2,4),16),b=parseInt(c.slice(4,6),16);var hover=function(n){return Math.max(0,Math.min(255,Math.round(n*0.88)))};var soft='rgba('+r+','+g+','+b+',0.12)';root.style.setProperty('--accent-hover','rgb('+hover(r)+','+hover(g)+','+hover(b)+')');root.style.setProperty('--accent-soft',soft);}catch(e){}}var text=localStorage.getItem('textColor');if(text){root.style.setProperty('--text-primary',text);try{var c2=text.replace('#','');if(c2.length===3){c2=c2[0]+c2[0]+c2[1]+c2[1]+c2[2]+c2[2]}var r2=parseInt(c2.slice(0,2),16),g2=parseInt(c2.slice(2,4),16),b2=parseInt(c2.slice(4,6),16);var s=function(n,f){return Math.max(0,Math.min(255,Math.round(n*f)))};root.style.setProperty('--text-secondary','rgb('+s(r2,0.78)+','+s(g2,0.78)+','+s(b2,0.78)+')');root.style.setProperty('--text-tertiary','rgb('+s(r2,0.62)+','+s(g2,0.62)+','+s(b2,0.62)+')');root.style.setProperty('--text-muted','rgb('+s(r2,0.5)+','+s(g2,0.5)+','+s(b2,0.5)+')');}catch(e){}}}catch(e){}})();`,
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
