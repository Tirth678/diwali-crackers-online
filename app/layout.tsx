import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diwali Crackers Online — Hand Gesture Celebration",
  description: "Select and burst Diwali crackers using hand gestures — both hands tracked, camera on, single-tap to select and double-tap to burst!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
