import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathly | Smart planning for every role",
  description:
    "Pathly is a role-aware productivity platform that helps students, employees, and teachers turn messy responsibilities into clear next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
