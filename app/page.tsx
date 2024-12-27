export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Firstfruit Real Estate
          </h1>
          <p className="text-lg mb-6">
            Building your wealth through innovative real estate solutions.
          </p>
          <a
            href="#services"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-200"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">About Us</h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto">
            Firstfruit Real Estate is dedicated to helping individuals and
            families achieve financial freedom through real estate investments.
            We focus on innovation, integrity, and long-term growth.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Property Investment</h3>
              <p className="text-gray-700">
                We help you identify, evaluate, and acquire the right properties
                for your portfolio.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Portfolio Management</h3>
              <p className="text-gray-700">
                Our team ensures your real estate portfolio grows sustainably
                over time.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Rehabilitation Services</h3>
              <p className="text-gray-700">
                Transform distressed properties into profitable investments with
                our expert guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="mb-6 text-gray-700">
            Reach out to us today to learn more about how we can help you
            achieve your real estate goals.
          </p>
          <a
            href="mailto:kade@firstfruitrealestate.com"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
