import type { Metadata } from "next";
import { Sansita, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import { SocketProvider } from "@/lib/socket-context";

const sansita = Sansita({
  variable: "--font-sansita",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Taskery",
  description: "Webapp for managing organizatoions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SocketProvider>
      <html lang="en">
        <Providers>
          <Toaster richColors />
          <body
            className={`${nunitoSans.className} ${sansita.variable} antialiased`}
          >
            {children}
          </body>
        </Providers>
      </html>
    </SocketProvider>
  );
}
