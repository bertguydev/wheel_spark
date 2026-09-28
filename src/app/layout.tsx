import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "SparkyWheel",
  description:
    "SparkyWheel is a free online random decision wheel to help you pick an option and make everyday decisions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head><link rel="canonical" href="/" /></head>
      <body>{children}</body>
    </html>
  );
}
