function Admissions() {
  return (
    <section id="admissions" className="py-16 bg-gradient-to-r from-blue-50 to-yellow-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Admissions</h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-4"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-blue-800 mb-6">Admission Process</h3>
            <div className="space-y-4">
              {[["Submit Application","Complete our online application form with required documents"],["Assessment Test","Take our placement assessment to determine appropriate grade level"],["Enrollment","Complete enrollment process and prepare for classes"]].map(([title, desc], i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">{i+1}</div>
                  <div><h4 className="font-semibold text-blue-700">{title}</h4><p className="text-gray-600">{desc}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-blue-800 mb-3">Required Documents</h4>
              <ul className="text-gray-700 space-y-1">
                <li>• Filled & Signed School Forms</li>
                <li>• Previous school Records. (If Available) </li>
                <li>• Parent/Guardian identification</li>
                <li>• Recent passport-size photographs</li>
              </ul>
            </div>
          </div>
          <div>
            <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Application Deadlines</h4>
              <p className="text-yellow-700"><strong>Beginning Of First Term:</strong> September 7th, 2026</p>
            </div>
            <div className="text-center mt-4">
              <button className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg">
                Download Application Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admissions