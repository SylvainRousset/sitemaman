import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import Navigation from "@/components/Navigation";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: "Bibliothèque Familiale",
  description: "Partage de livres en famille",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={libreBaskerville.variable}>
      <body className={`${inter.className} bg-[#fdfaf5] min-h-screen`}>
        <div className="min-h-screen">
          <header className="bg-gradient-to-r from-[#6b4f3a] to-[#8b7355] text-white shadow-lg">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-serif text-4xl font-bold flex items-center gap-3">
                  📚 Bibliothèque Familiale
                </h1>
              </div>
              <p className="text-[#f5e6d3] mb-6 text-lg">Partagez vos lectures en famille</p>
              <Navigation />
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-8 py-10">
            {children}
          </main>
          <ScrollToTop />
        </div>
      </body>
    </html>
  );
}
