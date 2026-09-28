function Header() {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex py-4 first:pt-0 last:pb-0">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Funmade Blueberry School</h1>
              <p className="text-blue-200 text-sm">Excellence in Education</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-decoration-line: none;">
            <a href="#home" className="text-white hover:text-yellow-600 transition-colors text-decoration-line: none">Home</a>
            <a href="#about" className="hover:text-yellow-300 transition-colors text-white">About</a>
            <a href="#programs" className="hover:text-yellow-300 transition-colors text-white">Programs</a>
            <a href="#admissions" className="hover:text-yellow-300 transition-colors text-white">Admissions</a>
            <a href="#contact" className="hover:text-yellow-300 transition-colors text-white">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header
