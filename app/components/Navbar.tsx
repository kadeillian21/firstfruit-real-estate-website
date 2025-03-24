import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { SocialMediaBar } from './SocialMediaBar';

export function Navbar() {
  return (
    <nav className="bg-forest sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center py-4">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="flex items-center space-x-2 text-lg font-serif uppercase text-white">
            <Image
              src="/firstfruit-logo.png"
              alt="Firstfruit Logo"
              height={50}
              width={50}
            />
            <div className="leading-tight">
              <span className="block">Firstfruit</span>
              <span className="block">Real Estate</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-8 text-white font-serif">
          <li className="relative group">
            <Link href="/about" className="hover:opacity-80 transition-colors flex items-center">
              About
            </Link>
          </li>
          <li className="relative group">
            <Link href="/our-work" className="hover:opacity-80 transition-colors flex items-center">
              Our Work
            </Link>
          </li>
          <li className="relative group">
            <Link href="/brrrr-calculator" className="hover:opacity-80 transition-colors flex items-center">
              BRRRR Calculator
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:opacity-80 transition-colors">
              Contact Us
            </Link>
          </li>
        </ul>
        <SocialMediaBar />
      </div>
    </nav>
  );
}
