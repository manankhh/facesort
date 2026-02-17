import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FaceSort — AI Face Detection for Google Photos",
  description: "Scan Google Photos albums, detect unique faces, and export individual portraits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
