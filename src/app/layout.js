import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ModeProvider } from "@/context/ModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Haiten Super Innova Siêu To Khổng Buồi",
  description: "Web này gay vl:))",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SpeedInsights />
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
