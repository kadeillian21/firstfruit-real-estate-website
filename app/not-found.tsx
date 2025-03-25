import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-navy mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Page Not Found</h2>
        <p className="text-lg text-gray-700 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-grass text-white py-3 px-6 rounded-md font-medium transition-colors hover:bg-grass/90"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}