import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function HelpCenter() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState(null);

  useEffect(() => {
    updateMetaTags({
      title: "Help Center | PrepForce AI",
      description: "Search for solutions, troubleshooting guides, and support articles regarding accounts, exams, mock tests, and payments on PrepForce AI.",
      keywords: "Help Center, PrepForce AI Support Articles, Password Reset Help, Payment Support",
      canonicalUrl: `${window.location.origin}/help-center`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Help Center - PrepForce AI",
      "description": "Guides and answers for common user issues on the PrepForce AI platform.",
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

  const categories = [
    { id: "all", label: "All Topics" },
    { id: "account", label: "🔑 Account & Login" },
    { id: "exams", label: "⏱️ Exams & Tests" },
    { id: "billing", label: "💳 Payments & Premium" }
  ];

  const articles = [
    {
      id: "hc-1",
      category: "account",
      title: "How do I reset my password?",
      content: "If you forgot your password, go to the Sign In page and click 'Forgot Password?'. Enter your registered email address, and we will send you a secure link to reset your password. The link is valid for 1 hour. If you do not receive the email, please check your Spam or Junk folder."
    },
    {
      id: "hc-2",
      category: "account",
      title: "Can I change my registered email or exam goal?",
      content: "Yes, you can edit your profile details at any time. Log in to your account, click on your profile/avatar, or navigate directly to /profile. Here you can change your target exam goal (e.g. ASF, PMA, Police), your city, gender, and education level. However, for security reasons, you cannot change your registered email directly; please contact support if you need to update it."
    },
    {
      id: "hc-3",
      category: "account",
      title: "How does Google Login work?",
      content: "Google Login is the fastest and most secure way to access PrepForce AI. Simply click 'Continue with Google' on the login or registration page. This authenticates you using your existing Google account credentials. We only collect your public profile details (name, email, and avatar) to create your PrepForce AI account."
    },
    {
      id: "hc-4",
      category: "exams",
      title: "How do I generate a custom mock test?",
      content: "To generate a custom test, log in and navigate to the Generate Test section from your Dashboard. Choose your target exam category, select specific topics/subjects (such as General Knowledge, Intelligence, English, or Mathematics), select the total number of questions, and click 'Generate'. The system will pull random questions matching your target syllabus."
    },
    {
      id: "hc-5",
      category: "exams",
      title: "Why does my test simulator close unexpectedly?",
      content: "Our simulator expects you to remain on the exam tab. If you switch tabs, close the browser window, or lose internet connectivity for an extended period, the exam simulator will automatically submit your test. This is to ensure strict exam simulation integrity. Please make sure you have a stable connection and no background distractions before launching a test."
    },
    {
      id: "hc-6",
      category: "exams",
      title: "Where can I view my certificates?",
      content: "Certificates are automatically generated when you score 70% or higher in any official mock test. To view or download them, go to your Student Dashboard, scroll down to the 'Practice History & Certificates' section. If you scored 70%+, you will see a 'Download Certificate' button next to that test entry."
    },
    {
      id: "hc-7",
      category: "billing",
      title: "Is PrepForce AI free to use?",
      content: "Yes, PrepForce AI has a generous free tier! Every registered user can generate free custom tests and access core dashboard analytics. We also offer Premium exam preparation keys for specific specialized forces or high-demand test banks to help cover server and development costs."
    },
    {
      id: "hc-8",
      category: "billing",
      title: "What payment methods do you accept?",
      content: "We accept payments through secure Pakistani channels including EasyPaisa, JazzCash, and direct bank transfers. When purchasing a premium activation key, instructions will be displayed showing our merchant details. Once you transfer the amount and submit the transaction receipt, our admin team verifies and activates your key."
    },
    {
      id: "hc-9",
      category: "billing",
      title: "How long does premium key activation take?",
      content: "Once you transfer the fee and submit your transaction proof in the activation portal, our administrators verify the payment. This process is usually completed within 15 minutes to 2 hours during normal business hours (9 AM - 9 PM). If your key is not activated after 4 hours, please contact us with your receipt."
    }
  ];

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = activeCategory === "all" || art.category === activeCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleArticle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
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
            KNOWLEDGE BASE
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            How can we help you?
          </h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search help articles (e.g. reset password, certificate)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 shadow-sm transition"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedArticle(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Accordion List */}
        <div className="space-y-4">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((art) => {
              const isExpanded = expandedArticle === art.id;
              return (
                <div
                  key={art.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => toggleArticle(art.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                      {art.title}
                    </span>
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
                      {art.content}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl space-y-3">
              <span className="text-4xl block">🔍</span>
              <p className="font-semibold text-gray-500 dark:text-slate-400">
                No articles matched your search: "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Still stuck? Need personalized support?</h3>
          <p className="text-xs text-gray-650 dark:text-slate-400 max-w-md mx-auto">
            If you cannot find the answer to your problem, please fill out our contact support form and our agents will respond as soon as possible.
          </p>
          <button
            onClick={() => navigate("/contact-us")}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
          >
            Create Support Ticket
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
