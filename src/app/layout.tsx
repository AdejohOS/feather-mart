import type { Metadata } from "next";
import "./globals.css";
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@/providers/query-provider";

const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FeatherMart - Your Trusted Marketplace for Fresh Poultry",
  description:
    "Discover fresh, locally-sourced poultry from trusted farmers on FeatherMart. Explore a wide range of products, connect with nearby sellers, and enjoy a seamless shopping experience with secure payments and delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `min-h-screen text-neutral-500 antialiased`,
          figtree.className
        )}
      >
        <NuqsAdapter>
          <QueryClientProvider>{children}</QueryClientProvider>
        </NuqsAdapter>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
