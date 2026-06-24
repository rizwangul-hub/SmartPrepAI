import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function AboutUs() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    updateMetaTags({
      title: "About Us | PrepForce AI",
      description: "Learn about PrepForce AI, Pakistan's leading AI-driven test preparation platform for ASF, Army, Navy, PAF, Police, and entry tests.",
      keywords: "About PrepForce AI, Online Test Preparation Pakistan, AI MCQ Generator, Army Navy PAF Test Prep",
      canonicalUrl: `${window.location.origin}/about-us`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Us - PrepForce AI",
      "description": "Information about PrepForce AI and its state-of-the-art preparation platform.",
      "publisher": {
        "@type": "Organization",
        "name": "PrepForce AI",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/favicon.png`
        }
      }
    });
  }, []);

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Question Bank",
      desc: "Our intelligent engine matches your target recruitment syllabus and generates personalized practice questions."
    },
    {
      icon: "⏱️",
      title: "Real-time Exam Simulator",
      desc: "Simulate actual written exams with accurate timing, section cutoffs, and mock stress conditions."
    },
    {
      icon: "📊",
      title: "Performance Analytics",
      desc: "Detailed score breakdowns, subject-wise weakness detection, and instant progress tracking."
    },
    {
      icon: "💡",
      title: "Detailed Explanations",
      desc: "Every MCQ comes with step-by-step reasoning so you learn from your mistakes instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500 flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between transition-colors duration-500">
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <img src={logoImg} alt="PrepForce AI Logo" className="h-10 w-auto object-contain rounded-xl" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
            WHO WE ARE
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Empowering Pakistan's Aspirants
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            PrepForce AI is a specialized educational technology platform built to redefine how candidates prepare for national recruits, forces exams, and academic entry tests.
          </p>
        </div>

        {/* Introduction Cards */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-sm space-y-6 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Story</h2>
          <p className="text-gray-600 dark:text-slate-350">
            For years, candidate preparation in Pakistan has suffered from outdated books, expensive academy fees, and generalized test preparation material. Aspiring officers and recruits for the armed forces, civil departments, and medical/engineering universities lacked a way to test their readiness objectively.
          </p>
          <p className="text-gray-600 dark:text-slate-350">
            PrepForce AI was launched in 2026 to bridge this gap. By utilizing modern web development and smart algorithms, we provide an interactive testing environment that adapts to the specific needs of candidates. We ensure that every aspirant—regardless of their financial background or geographic location—has access to high-quality preparation materials.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">What Makes Us Stand Out</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm hover:scale-[1.02] transition-transform duration-300 flex gap-4 items-start"
              >
                <div className="text-3xl bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-2xl flex-shrink-0">
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-450 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Ecosystem Callout */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Looking for Interview Practice?</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 max-w-xl mx-auto">
            We partner with <strong>ForceReady AI</strong> to offer specialized, AI-driven physical and interview assessment advice for PMA, ISSB, and recruiting boards.
          </p>
          <a
            href="https://www.forcereadyai.online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow transition"
          >
            Visit ForceReady AI
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
