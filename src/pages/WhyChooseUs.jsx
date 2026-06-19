import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function WhyChooseUs() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    updateMetaTags({
      title: "Why Choose PrepForce AI | Best Test Prep Platform",
      description: "Explore 8 reasons why PrepForce AI is the ultimate online platform for forces, civil service, and university admission preparation in Pakistan.",
      keywords: "Why Choose PrepForce AI, Online Test Prep Advantages, AI Study Plan Benefits, Pakistani Exam Platform",
      canonicalUrl: `${window.location.origin}/why-choose-us`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Why Choose Us - PrepForce AI",
      "description": "8 unique advantages of using PrepForce AI over traditional academies.",
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

  const points = [
    {
      icon: "🎯",
      title: "100% Realistic Exam Simulations",
      desc: "Our interface, timing limits, and question distribution closely resemble actual recruiting agency and academic test paper patterns."
    },
    {
      icon: "🧠",
      title: "AI-Driven Progress Tracking",
      desc: "Get personalized suggestions pinpointing exactly which topics (like GK, English, Maths, or Intelligence) need more effort."
    },
    {
      icon: "💰",
      title: "Save Heavy Academy Fees",
      desc: "Save 30,000+ PKR on expensive physical academies by utilizing our self-paced learning portal anywhere, anytime."
    },
    {
      icon: "📚",
      title: "Comprehensive Syllabus Coverage",
      desc: "From basic verbal intelligence to advanced quantitative reasoning and general knowledge, we leave no topic behind."
    },
    {
      icon: "🔄",
      title: "Up-to-Date Past Papers & MCQs",
      desc: "Practice with mock tests inspired by authentic past papers from recent ASF, Army, Navy, PAF, and Police examinations."
    },
    {
      icon: "⚡",
      title: "Instant Diagnostic Analytics",
      desc: "Understand your strengths immediately after submitting a mock test. No waiting for manual marking results."
    },
    {
      icon: "📅",
      title: "Customized AI Study Plans",
      desc: "Generate smart schedules based on your target test date and daily preparation hours to cover the entire curriculum."
    },
    {
      icon: "📱",
      title: "Mobile & Desktop Optimized",
      desc: "Learn seamlessly on your smartphone or PC. Our interface transitions perfectly for on-the-go revision."
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
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 text-xs font-semibold tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 rounded-full">
            OUR BENEFITS
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-500 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            Why PrepForce AI is Your Best Bet
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Traditional academies are expensive, rigid, and time-consuming. Here is why thousands of candidates choose our online preparation portal.
          </p>
        </div>

        {/* 8 points grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((pt, idx) => (
            <div 
              key={idx} 
              className="group p-6 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm hover:scale-[1.03] hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-3">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{pt.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {pt.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Ready to Boost Your Exam Readiness?</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Register today and experience real mock exams, immediate analytical evaluations, and targeted revision content.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow transition"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800/50 rounded-2xl transition"
            >
              Access Member Area
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
