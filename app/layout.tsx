import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "MOLLIS LUX",
  description: "MOLLIS LUX Hotel",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
   <html
  lang="en"
  className="h-full antialiased"
  data-scroll-behavior="smooth"
>
  <body className="min-h-full flex flex-col">
    {children}
  </body>
</html>
  );
}
