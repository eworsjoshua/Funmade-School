function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white py-20">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl font-bold mb-6 animate-pulse">Welcome to Funmade Blueberry School</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Nurturing minds, building futures. Join our community of learners and discover your potential.
        </p>
        <div className="mt-20 gap-5">
          <button className="bg-yellow-400 text-blue-900 px-10 py-3 rounded-lg border-2 border-white font-semibold hover:bg-yellow-300 transition-colors shadow-lg">
            Apply Now
          </button>
          <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero
