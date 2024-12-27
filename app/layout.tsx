import './globals.css';

export const metadata = {
  title: 'Firstfruit Real Estate',
  description: 'Empowering your real estate investments with innovative solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="bg-indigo-600 text-white py-4">
          <div className="container mx-auto flex justify-between items-center px-4">
            <h1 className="text-xl font-bold">Firstfruit Real Estate</h1>
            <nav>
              <ul className="flex gap-4">
                <li>
                  <a href="#about" className="hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:underline">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:underline">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-800 text-white py-6 mt-10">
          <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} Firstfruit Real Estate. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
