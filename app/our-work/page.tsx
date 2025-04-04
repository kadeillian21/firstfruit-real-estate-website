"use client";

export default function OurWorkPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center"
      style={{
        backgroundImage: 'url("/blueprints-stock.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Work</h1>
        <p className="text-lg text-gray-600 mb-6">
          We are working hard to showcase our portfolio. Stay tuned for updates!
        </p>
        <p className="text-xl font-semibold text-gray-800">Coming Soon</p>
      </div>
    </div>
  );
}
