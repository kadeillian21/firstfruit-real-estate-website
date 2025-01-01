import React from 'react';
import Navbar from './components/Navbar';
import "./styles/globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-black text-white">
        <header className="bg-gray-900 p-4">
          <Navbar />
        </header>
        <main className="flex-grow">{children}</main>
        <footer className="bg-gray-800 p-4">
          <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} Firstfruit Real Estate LLC</p>
          </div>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
