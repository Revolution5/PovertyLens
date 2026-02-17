import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
// ============== Marisol Morales Code 2/9/2026 for Dark mode start ============== //
import { ThemeProvider } from "../components/ThemeProvider";
// ============== Marisol Morales code 2/9/2026 End ============== //

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PovertyLens",
  description: "Transform complex poverty data into meaningful insights. Explore statistics, stories, and ways to make a difference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ============== Marisol Morales Code 2/9/2026 - ADDED suppressHydrationWarning ============== //
    // This prevents console warnings when the theme class is added to <html>
    <html lang="en" suppressHydrationWarning>
    {/* ============== Marisol Morales Code 2/9/2026 - end ============== */}
      <body className={`${inter.className} antialiased`}>
        {/* ============== Marisol Morales Code 2/9/2026 start ============== */}
        {/* ThemeProvider manages theme state and persists it to localStorage */}
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
        {/* ============== Marisol Morales Code 2/9/2026 end ============== */}
      </body>
    </html>
  );
}