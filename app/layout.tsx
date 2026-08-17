import type { Metadata } from "next";
import "./globals.css";
import "./admin-auth.css";

export const metadata: Metadata = {
  title: "The Oddment Club — Custom 3D Printed Objects",
  description: "Design a one-of-a-kind 3D printed name tag.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
