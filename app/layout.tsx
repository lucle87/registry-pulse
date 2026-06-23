import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry Pulse - Company lookup from official registries",
  description: "Verify any company from GLEIF, UK Companies House, and US SEC EDGAR. Pay-per-call via MPP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0d12", color: "#e8eaf0", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
