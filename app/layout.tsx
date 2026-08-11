import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Form & Fable — Custom Name Tags",
  description: "Design a one-of-a-kind 3D printed name tag.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
