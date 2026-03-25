import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
// ============== Marisol Morales Code 2/9/2026 for Dark mode start ============== //
import { ThemeProvider } from "../components/ThemeProvider";
// ============== Marisol Morales code 2/9/2026 End ============== //
// Added by Reymes 3/24/2026 - colorblind mode provider
import { ColorblindProvider } from "../components/ColorblindProvider";

// daniel q. 2/28/26 start
import BackendStatus from "../components/BackendStatus";
// daniel q. 2/28/26 end
import AIChatBot from "../components/AIChatBot"; // Added by Reymes - 03/24/2026

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
      {/* suppressHydrationWarning added by Reymes 3/24/2026 — prevents hydration mismatch
           caused by browser extensions (Grammarly, autofill) injecting attributes like
           data-gr-ext-installed and fdprocessedid before React hydrates */}
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* ============== Marisol Morales Code 2/9/2026 start ============== */}
        {/* ThemeProvider manages theme state and persists it to localStorage */}
        
        {/* daniel q. 2/28/26 start */}
        <BackendStatus />
        {/* daniel q. 2/28/26 end */}

        <ThemeProvider>
          {/* Added by Reymes 3/24/2026 – ColorblindProvider applies CSS class + supplies context */}
          <ColorblindProvider>
            <Navbar />
            {children}
            {/* Added by Reymes - 03/24/2026 - AI Chat Bot */}
            <AIChatBot />
          </ColorblindProvider>
        </ThemeProvider>
        {/* ============== Marisol Morales Code 2/9/2026 end ============== */}
      </body>
    </html>
  );
}