import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function OurMission() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    updateMetaTags({
      title: "Our Mission | PrepForce AI",
      description: "Discover the mission behind PrepForce AI: enabling equal educational opportunities and free/affordable exam preparation resources in Pakistan.",
      keywords: "Our Mission, PrepForce AI Vision, Free Mock Tests Pakistan, Affordable Academy Alternatives",
      canonicalUrl: `${window.location.origin}/our-mission`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Our Mission - PrepForce AI",
      "description": "Learn about the mission, goals, and values of PrepForce AI in Pakistan's educational sector.",
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

  const pillars = [
    {
      icon: "🌍",
      title: "Universal Accessibility",
      desc: "Providing test prep materials to candidates in remote regions of Balochistan, KPK, Sindh, Punjab, AJK, and Gilgit-Baltistan, who cannot access physical training academies."
    },
    {
      icon: "💎",
      title: "Affordable & Free Options",
      desc: "Offering generous free-tier mock tests and budget-friendly premium features so that financial status never hinders a candidate's selection."
    },
    {
      icon: "📈",
      title: "Empowering Meritocracy",
      desc: "Creating an unbiased, data-backed scoring mechanism that helps students improve based purely on their dedication, intelligence, and practice."
    },
    {
      icon: "🛡️",
      title: "Accurate & Reliable Content",
      desc: "Continuously vetting our syllabus-aligned question pools to ensure that practice mock tests resemble current recruitment standards."
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
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 text-xs font-semibold tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 rounded-full">
            OUR PURPOSE
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-500 via-pink-600 to-indigo-500 bg-clip-text text-transparent">
            Democratizing Exam Prep
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-450 max-w-xl mx-auto">
            We believe that high-quality exam preparation should be a right, not a luxury reserved for those who can afford expensive academies.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm space-y-6 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Core Mission</h2>
          <p className="text-gray-600 dark:text-slate-350">
            To build a technologically advanced, incredibly intuitive, and highly accessible online test platform designed tailored to Pakistani recruitment and academic entry exams. We commit to keeping our prices low, our free tier extensive, and our tools continuously updated to reflect real-world syllabus updates.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => (
            <div 
              key={idx} 
              className="p-8 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4 text-left"
            >
              <div className="text-4xl">{p.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
