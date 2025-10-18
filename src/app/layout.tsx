import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationProvider from "@/lib/contexts/NotificationContext";
import NotificationContainer from "@/components/NotificationContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forte Automator",
  description: "Rule-based automation dApp on Flow + Forte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-gray-800`}
      >
        <NotificationProvider>
          <div className="min-h-screen bg-background text-gray-800">
            {children}
          </div>
          <NotificationContainer />
        </NotificationProvider>
      </body>
    </html>
  );
}
