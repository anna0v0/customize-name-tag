import type { Metadata } from "next";
import "./globals.css";
import "./admin-auth.css";
import ConsentBanner from "@/components/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "The Oddment Club — Custom 3D Printed Objects",
  description: "Design a one-of-a-kind 3D printed name tag.",
  alternates: { canonical: "/" },
  openGraph: { title:"The Oddment Club — Custom 3D Printed Objects", description:"Design personalised 3D printed objects in your browser.", type:"website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<ConsentBanner/></body></html>;
}
