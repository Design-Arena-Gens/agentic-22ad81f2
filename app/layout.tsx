import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Strong Parents | Strong Miracles',
  description: 'A short, emotional micro-story told in seven scenes.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
