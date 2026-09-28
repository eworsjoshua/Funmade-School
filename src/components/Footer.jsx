function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-15 h-15 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-lg">A</span>
              </div>
              <h3 className="font-bold text-lg">Funmade Blueberry School</h3>
            </div>
            <p className="text-gray-400 text-sm">Dedicated to providing quality education and nurturing the next generation of leaders.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-yellow-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[["#home","Home"],["#about","About Us"],["#programs","Programs"],["#admissions","Admissions"]].map(([href, label]) => (
                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-yellow-300">Programs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Elementary School</li><li>Middle School</li><li>High School</li><li>Summer Programs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-yellow-300">Contact Info</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📍 Olorunda Road, Idiagbon, Ogun.</p>
              <p>📞 +234 805 6871 952 </p>
              <p>✉️ olufunmilayoadegbenro@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2026 Funmade Blueberry School. All rights reserved. | <a href="#" className="text-yellow-400 hover:text-yellow-300 ml-1">Privacy Policy</a> | <a href="#" className="text-yellow-400 hover:text-yellow-300 ml-1">Terms of Service</a></p>
        </div>
      </div>
    </footer>
  );
}
export default Footer