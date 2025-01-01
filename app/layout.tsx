import React from 'react';
import { Navbar } from './components/Navbar';
import "./styles/globals.css";
import { Footer } from './components/Footer';

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Firstfruit</title>
        <meta name="description" content="Firstfruit Real Estate - Your trusted real estate partner" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-mint text-slate">
        <header>
          <Navbar />
        </header>
        <main className="flex-grow">{children}</main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
