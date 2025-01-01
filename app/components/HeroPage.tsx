import React from "react";

export function HeroPage() {
  return (
    <section className="relative bg-gray-50">
      {/* Hero Image */}
      <div className="absolute inset-0">
        {/* <Image
          src="/vercel.svg"
          alt="Hero Background"
          className="w-full h-full object-cover"
          height={1}
          width={1}
        /> */}
        <div className="absolute inset-0 bg-black opacity-30"></div> {/* Overlay */}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto flex flex-col items-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-white">
          Start Your Journey with Firstfruit Real Estate
        </h1>
        <p className="text-lg text-gray-200 mt-4">
          Building a legacy of growth, transformation, and community.
        </p>
        <div className="mt-6">
          <a
            href="#portfolio"
            className="px-6 py-3 bg-gold text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition-all"
          >
            View Our Work
          </a>
        </div>
      </div>
    </section>
  );
};
