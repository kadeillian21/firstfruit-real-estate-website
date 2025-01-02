import React from "react";

export function HeroPage() {
  return (
    <div
      className="relative bg-cover bg-center h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('https://source.unsplash.com/featured/?landscape')" }}
    >
      <div className="absolute inset-0 bg-navy bg-opacity-50"></div>
      <div className="relative text-center text-white px-6">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our World</h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Explore the beauty of endless possibilities and discover what makes us unique.
        </p>
        <div className="space-x-4">
          <a
            href="#about"
            className="bg-indigo-600 text-white py-3 px-6 rounded-md text-lg hover:bg-indigo-700 transition duration-300"
          >
            Learn More
          </a>
          <a
            href="#contact"
            className="bg-gray-100 text-black py-3 px-6 rounded-md text-lg hover:bg-gray-200 transition duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};
