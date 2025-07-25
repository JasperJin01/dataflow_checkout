import * as React from 'react';

import '@/styles/global.css';

import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
