import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import RootProviders from "@/components/providers/RootProviders";
import { Toaster } from "@/components/ui/sonner";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Minhas Finanças",
  description: "Minhas Finanças",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html 
        lang="pt-BR" 
        className="dark" 
        style={{
          colorScheme: "dark",
        }}
      >
        <body className={rubik.className}>
          <Toaster richColors position="bottom-right"/>
          <RootProviders>{children}</RootProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
