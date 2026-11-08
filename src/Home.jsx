import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Programs from "./components/Programs";
import Admissions from "./components/Admissions";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Programs />
      <Admissions />
      <Contact />
      <Footer />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-yellow-400 text-blue-900 w-12 h-12 rounded-full shadow-lg hover:bg-yellow-300 transition-colors font-bold text-lg z-50"
        title="Back to Top"
      >
        ↑
      </button>
    </div>
  );
}
