function About() {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">About Funmade Blueberry</h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Our Mission</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              At Alkifah Academy, we are committed to providing quality education that empowers students 
              to become confident, creative, and responsible global citizens.
            </p>
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Why Choose Us?</h3>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Experienced and qualified teachers</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Small class sizes for personalized attention</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Modern learning facilities</li>
              <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Comprehensive extracurricular programs</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-900">100+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-900">20+</div>
                <div className="text-sm text-gray-600">Teachers</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-900">10+</div>
                <div className="text-sm text-gray-600">Years</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About