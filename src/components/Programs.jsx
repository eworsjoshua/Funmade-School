function Programs() {
  const programs = [
    { title: "Nursery ", description: "Building strong foundations in core subjects.", grades: "Elementary", subjects: ["Mathematics", "English", "Rhymes", "Writing", "Art", "PE"] },
    { title: "Primary ", description: "Preparing students for high school with advanced curriculum.", grades: "Basic", subjects: ["Mathematics", "English", "Science", "Social Studies", "Art", "PE"] },
    { title: "Secondary ", description: "College preparatory courses for academic goals.", grades: "High Schooln", subjects: ["Calculus", "Physics", "Advanced English", "Marketing", "World History", "Computer Science", "Languages"] }
  ];
  return (
    <section id="programs" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Programs</h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-4"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-900 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">{program.title}</h3>
              <div className="text-yellow-600 font-medium mb-3">{program.grades}</div>
              <p className="text-gray-700 mb-4">{program.description}</p>
              <div className="flex flex-wrap gap-2">
                {program.subjects.map((subject, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{subject}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-blue-900 mb-4">Extracurricular Activities</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[["🎵","Music & Band"],["⚽","Sports Teams"],["🎭","Drama Club"],["🔬","Science Club"]].map(([icon, label]) => (
              <div key={label} className="bg-white p-4 rounded-lg">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Programs