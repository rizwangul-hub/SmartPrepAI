import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function FAQ() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    updateMetaTags({
      title: "Frequently Asked Questions (FAQ) | PrepForce AI",
      description: "Find answers to 25+ questions regarding force recruitments, AI study planners, simulator mock tests, and account billing on PrepForce AI.",
      keywords: "FAQ, PrepForce AI FAQ, PMA Prep Questions, ASF Exam Syllabus, Online Test Support",
      canonicalUrl: `${window.location.origin}/faq`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is PrepForce AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PrepForce AI is an advanced, AI-powered online preparation platform designed specifically for candidates preparing for recruitment tests in Pakistan's armed forces (Army, Navy, PAF), civil services (Police, ASF, ANF, FIA), and university entrance exams."
          }
        },
        {
          "@type": "Question",
          "name": "Is PrepForce AI affiliated with the Government of Pakistan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. PrepForce AI is a private, independent educational technology initiative. We have no affiliation, association, or endorsement from the Airport Security Force, Pakistan Army, or any government agency."
          }
        }
      ]
    });
  }, []);

  const faqData = [
    {
      category: "General",
      q: "What is PrepForce AI?",
      a: "PrepForce AI is Pakistan's premier AI-powered test preparation portal. It offers simulated mock tests, custom test generators, progress tracking, and AI study planners specifically designed to help candidates prepare for national exams."
    },
    {
      category: "General",
      q: "Is PrepForce AI affiliated with the Government of Pakistan?",
      a: "No. PrepForce AI is an entirely independent, private educational platform. We have no official affiliation with, endorsement from, or connection to the Airport Security Force (ASF), Pakistan Armed Forces, Police, or any recruiting department."
    },
    {
      category: "General",
      q: "Can I prepare for civil services or university entrance exams here?",
      a: "Yes! In addition to military and security forces exams, our question banks include resources for provincial police exams, FIA, MDCAT, and ECAT entry preparation."
    },
    {
      category: "General",
      q: "Is there a physical office or campus I can visit?",
      a: "PrepForce AI is a fully digital platform. This keeps our operational costs low so that we can offer high-quality preparation materials to you at a fraction of typical physical academy rates."
    },
    {
      category: "General",
      q: "What is the relationship with ForceReady AI?",
      a: "ForceReady AI is our partner platform focused on physical tests, initial interview guidelines, and ISSB preparation. PrepForce AI is dedicated to written exam academic preparation."
    },
    {
      category: "Exams & Syllabus",
      q: "Which specific forces exams are covered?",
      a: "We support preparation for the Airport Security Force (ASF Assistant/Sub-Inspector/Corporal), Pakistan Army (PMA Long Course, Technical Cadet, Soldier), Pakistan Navy (Cadet, Sailor), Pakistan Air Force (GDP, Aeronautical, Airman), and Provincial Police (SI/ASI/Constable)."
    },
    {
      category: "Exams & Syllabus",
      q: "Are the mock tests based on actual past papers?",
      a: "Yes. Our MCQ question banks are compiled, categorized, and updated based on real questions asked in past written tests conducted by various recruiting boards over the last 5-10 years."
    },
    {
      category: "Exams & Syllabus",
      q: "How frequently is the question bank updated?",
      a: "Our content administrators update the question pools monthly to ensure new exam trends, general knowledge details, and intelligence logic patterns are included."
    },
    {
      category: "Exams & Syllabus",
      q: "Does the system support Urdu medium candidates?",
      a: "Yes, for recruit/corporal exams where written papers feature both Urdu and English questions, our database supports translation and multi-lingual question displays."
    },
    {
      category: "Exams & Syllabus",
      q: "What subjects are included in the intelligence tests?",
      a: "We have dedicated intelligence sections for both Verbal Intelligence (analogy, series, classification) and Non-Verbal Intelligence (pattern completion, mirror images, matrix puzzles)."
    },
    {
      category: "Simulator & Analytics",
      q: "How does the Mock Test Simulator work?",
      a: "The simulator mimics the exact conditions of the official exam. Once started, a countdown timer is triggered, navigation controls let you skip or flag questions, and the test submits automatically when the time runs out."
    },
    {
      category: "Simulator & Analytics",
      q: "Can I view the correct answers after completing a test?",
      a: "Absolutely! After finishing a test, you are taken to a detailed results page. It displays your score, target benchmark, subject-wise analysis, and lets you inspect each question to see the correct answer along with explanations."
    },
    {
      category: "Simulator & Analytics",
      q: "What is the threshold for earning a Certificate?",
      a: "You must score 70% or higher in any official mock test simulator. Once achieved, a secure, digital certificate is issued on your dashboard practice history."
    },
    {
      category: "Simulator & Analytics",
      q: "How does the AI Study Planner work?",
      a: "When you select your target exam and input your test date along with how many hours you can study daily, our AI parses the syllabus and generates a custom day-by-day prep plan."
    },
    {
      category: "Simulator & Analytics",
      q: "Can I pause a mock test and resume it later?",
      a: "No. To maintain the realistic nature of exam simulations and prevent candidates from searching for answers online, mock tests cannot be paused once started."
    },
    {
      category: "Profile & Security",
      q: "Is my personal dashboard data kept private?",
      a: "Yes. We take privacy seriously. Your dashboard stats, target exam selections, email, and mock test scores are encrypted and only accessible by you and the site administrator."
    },
    {
      category: "Profile & Security",
      q: "How do I change my target force or goal?",
      a: "Navigate to your Profile page. Under Account Settings, you will find a dropdown for 'Target Exam Goal'. Simply choose your new target and click 'Save Changes' to update your dashboard layout."
    },
    {
      category: "Profile & Security",
      q: "Can I delete my test attempt history?",
      a: "By default, your practice history is retained so that your performance graph can accurately track your improvement. If you wish to wipe your dashboard stats, contact support."
    },
    {
      category: "Profile & Security",
      q: "Why does my profile photo not show up?",
      a: "If you logged in via Google, we fetch your Google profile picture. If you registered manually, you can upload a profile picture from your computer via the Profile page settings."
    },
    {
      category: "Profile & Security",
      q: "How do I delete my PrepForce AI account?",
      a: "If you wish to permanently delete your account and all associated test histories, please submit a request through the Contact Us form, and our admin team will handle it within 24 hours."
    },
    {
      category: "Billing & Keys",
      q: "What is an Activation Key?",
      a: "An activation key is a unique token that unlocks full access to premium mock tests, specialized question banks, and advanced AI study planners for a specific target recruitment exam."
    },
    {
      category: "Billing & Keys",
      q: "How can I purchase an Activation Key?",
      a: "You can purchase keys through our payment page using EasyPaisa, JazzCash, or online bank transfer. After transferring the fee, upload the transaction receipt for instant admin validation."
    },
    {
      category: "Billing & Keys",
      q: "What is the validity period of an activation key?",
      a: "Most premium keys stay active for 90 days from the date of activation, which provides ample time to prepare for and sit your targeted force exam."
    },
    {
      category: "Billing & Keys",
      q: "Do you offer refunds if I change my mind?",
      a: "Since activation keys unlock digital access to our copyrighted question bank instantly, we do not offer refunds once a key has been validated and activated on an account."
    },
    {
      category: "Billing & Keys",
      q: "Can I share my activation key with a friend?",
      a: "No. Each activation key is locked to the specific account that applied it. Sharing accounts or keys will trigger security alerts and may lead to account suspension."
    }
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleFAQ = (idx) => {
    setExpandedFAQ(expandedFAQ === idx ? null : idx);
  };

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
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
            GOT QUESTIONS?
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-450 max-w-xl mx-auto">
            Browse through 25+ detailed questions and answers about our test simulator, syllabus coverage, and account features.
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search 25+ FAQs (e.g. Army, timer, EasyPaisa, past paper)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 shadow-sm transition"
            />
          </div>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, idx) => {
              const isExpanded = expandedFAQ === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md w-max">
                        {faq.category}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        {faq.q}
                      </span>
                    </div>
                    <span className="text-gray-400 text-lg transition-transform duration-300">
                      {isExpanded ? "➖" : "➕"}
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? "max-h-[300px] border-t border-gray-100 dark:border-slate-800/50" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 text-sm text-gray-600 dark:text-slate-350 leading-relaxed bg-gray-50/50 dark:bg-slate-950/20">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl space-y-3">
              <span className="text-4xl block">💡</span>
              <p className="font-semibold text-gray-500 dark:text-slate-400">
                No FAQs matched your query: "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear Search Query
              </button>
            </div>
          )}
        </div>

        {/* Support Section Callout */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Did not find your answer?</h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 max-w-sm mx-auto">
            Our support agents can help verify your activation keys, fix profile errors, or clarify syllabus topics.
          </p>
          <button
            onClick={() => navigate("/contact-us")}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
          >
            Submit Support Request
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
