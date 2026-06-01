
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exec OS - AI Executive Assistant",
  description:
    "Your AI Executive Assistant for Seamless Task Management and Productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body
          className={`${montserrat.className} min-h-full flex flex-col antialiased`}
        >
          {children}

          <footer>
            <div className="border-t border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} My App. All rights reserved.
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}