import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chicken Guy",
  description: "AI-app is support to the patients or doctor ,which would be used to the oral cancer detection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} bg-[#FAF6F0] h-full antialiased`}>
      <body className="min-h-full flex flex-col">
       
        {children}
  
        </body>
    </html>
  );
}