import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { SocialMediaBar } from './SocialMediaBar';

export function Navbar() {
  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center py-4">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="flex items-center space-x-2 text-lg font-serif uppercase text-green-700">
            <Image
              src="/firstfruit-logo.png"
              alt="Firstfruit Logo"
              height={50}
              width={50}
            />
            <span>Firstfruit Real Estate</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-10 text-green-700 font-serif">
          <li className="relative group">
            <Link href="/about" className="hover:text-green-900 transition-colors flex items-center">
              About
            </Link>
          </li>
          <li className="relative group">
            <Link href="/our-work" className="hover:text-green-900 transition-colors flex items-center">
              Our Work
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-green-900 transition-colors">
              Contact Us
            </Link>
          </li>
        </ul>
        <SocialMediaBar textColor='text-green-900' />
      </div>
    </nav>
  );
}
