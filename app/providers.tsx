"use client";

import { CartProvider } from "@/lib/CartContext";
import { Toaster } from "sonner";

/**
 * Client-side providers wrapper.
 * layout.tsx is a Server Component so we cannot put "use client" providers
 * there directly — we extract them into this file instead.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "var(--font-inter), sans-serif",
          },
        }}
        richColors
        closeButton
      />
    </CartProvider>
  );
}
