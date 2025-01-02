import Image from "next/image";
import Link from "next/link";
import React from "react";

export function HeroPage() {
  return (
    <div className="relative bg-navy flex flex-col items-center justify-start">
      <div className="flex w-full h-[50vh] bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Image Section */}
        <div className="w-full sm:w-1/2 relative">
          <Image
            src="/living-room-stock-photo.jpg"
            alt="Living Room Stock Photo"
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* Text Section */}
        <div className="w-full sm:w-1/2 p-12 flex flex-col justify-start space-y-6">
          <h1 className="text-4xl font-semibold text-gray-800">Welcome to Firstfruit Real Estate</h1>
          <p className="text-lg text-gray-600">
            Our mission at Firstfruit Real Estate is to buy, renovate, and provide high quality housing for the communities we serve. We look to use the resources we are given to create a product greater than the components that made it.
          </p>
          <Link href="/contact" className="bg-grass text-white text-center hover:opacity-80 px-6 py-3 rounded-lg shadow-lg text-xl hover:bg-primary-dark transition duration-300">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Cards Section */}
      <div className="w-[75vw] py-12 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Who we are */}
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 h-[30vh] hover:scale-105">
            <h2 className="text-2xl text-center font-semibold text-gray-800">Who We Are</h2>
            <p className="text-lg text-gray-600">
              At Firstfruit Real Estate, we’re all about transformation. We specialize in revitalizing distressed properties into stunning, high-quality homes that stand out. Our goal is to create spaces we’d be proud to call our own—modern, timeless, and designed with care for tenants seeking something special.
            </p>
          </div>

          {/* Card 2: Our Mission */}
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 hover:scale-105">
            <h2 className="text-2xl text-center font-semibold text-gray-800">Our Mission</h2>
            <p className="text-lg text-gray-600">
              Our mission is simple: breathe new life into neighborhoods by offering affordable, top-tier housing that reflects the heart of the communities we serve. With integrity, honesty, and respect, we aim to foster trust and deliver on our promises—every single time.
            </p>
          </div>

          {/* Card 3: Where We Are Heading */}
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 hover:scale-105">
            <h2 className="text-2xl text-center font-semibold text-gray-800">Where We Are Heading</h2>
            <p className="text-lg text-gray-600">
              Firstfruit Real Estate is committed to making a lasting impact. Our vision is to leverage our resources to uplift the communities we serve, enrich lives, and create a legacy of excellence in housing. Together, we’re building more than homes—we’re building futures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
