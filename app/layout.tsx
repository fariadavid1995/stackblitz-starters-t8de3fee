import { ReactNode } from "react";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata = { title: "Email Priority Briefing" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}