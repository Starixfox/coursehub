import * as React from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>
      <Footer />
    </div>
  );
}
