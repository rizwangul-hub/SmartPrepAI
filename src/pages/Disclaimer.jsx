import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function Disclaimer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Inject SEO metadata
    updateMetaTags({
      title: "Disclaimer | PrepForce AI",
      description: "Read the official disclaimer for PrepForce AI. Learn about our educational purpose and our independent status (no government affiliation).",
      keywords: "Disclaimer, PrepForce AI Disclaimer, No Government Affiliation, Educational Use Policy",
      canonicalUrl: `${window.location.origin}/disclaimer`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Disclaimer - PrepForce AI",
      "description": "Information regarding the independent status and educational nature of PrepForce AI.",
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
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Disclaimer
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Last Updated: June 2026
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm space-y-6 leading-relaxed">
          
          {/* CRITICAL ALERT BLOCK FOR NO AFFILIATION */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2">
            <h3 className="font-extrabold flex items-center gap-2">
              ⚠️ IMPORTANT NOTICE: NO GOVERNMENT AFFILIATION
            </h3>
            <p className="text-sm leading-relaxed font-semibold">
              PrepForce AI is an **independent, private educational platform**. PrepForce AI is **NOT** officially affiliated with, endorsed by, or connected to the Airport Security Force (ASF), Federal Investigation Agency (FIA), Anti Narcotics Force (ANF), Punjab/Sindh/KPK/Balochistan Police, Pakistan Army, Pakistan Navy, Pakistan Air Force (PAF), Pakistan Military Academy (PMA), Pakistan Medical Commission (PMC) for MDCAT, Engineering College Admission Test (ECAT), or any other government department, force branch, or recruiting commission.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Educational & Preparation Purposes Only</h2>
            <p>
              The content provided on PrepForce AI—including simulated mock tests, past paper questions, study plans, subject explanations, and AI tutor suggestions—is created solely for educational and test preparation purposes. While we help candidates train and practice for written and intelligence exams, using our platform does not guarantee selection, employment, or success in any official recruitment process.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Accuracy & Completeness of Information</h2>
            <p>
              While we make every effort to maintain the accuracy of our question banks and simulate mock tests based on real exam patterns, exam structures and syllabus requirements can change. PrepForce AI does not warrant or make any representations concerning the absolute accuracy, completeness, or reliability of materials on its platform or on any sites linked to this platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Exam Pattern & Syllabus Changes</h2>
            <p>
              Government departments, forces, and academic institutions modify their written test syllabi, marks distribution, and test modes dynamically. Candidates are strongly advised to refer to the official bulletins and job advertisements released by the respective recruiting bodies for the most updated and official details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. External Links & Partner Ecosystems</h2>
            <p>
              PrepForce AI may contain links to external sites that are not operated by us (for example, our partner site ForceReady AI). Please be aware that we have no control over the content and practices of these external sites, and cannot accept responsibility or liability for their respective policies.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
