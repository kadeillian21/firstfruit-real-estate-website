import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-2 text-2xl font-bold">
        <Image src="/favicon.ico" alt="Logo" className="w-6 h-6" height={3} width={3}/>
        <Link href="/">Firstfruit Real Estate</Link>
      </div>

      {/* Links */}
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <span className="hover:text-gray-300">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <span className="hover:text-gray-300">About</span>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <span className="hover:text-gray-300">Contact</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}