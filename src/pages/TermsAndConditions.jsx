import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Inject SEO metadata
    updateMetaTags({
      title: "Terms & Conditions | PrepForce AI",
      description: "Read the Terms and Conditions of PrepForce AI. Learn about user responsibilities, platform usage rules, content ownership, and policies.",
      keywords: "Terms and Conditions, PrepForce AI Terms, User Rules, Educational Platform Terms",
      canonicalUrl: `${window.location.origin}/terms-and-conditions`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms & Conditions - PrepForce AI",
      "description": "Understand the terms governing your use of PrepForce AI.",
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
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Last Updated: June 2026
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using <strong>PrepForce AI</strong>, you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Account Usage & Rules</h2>
            <p>
              When creating an account, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your account credentials (email and password) and for restricting access to your computer. Sharing your account with others to access premium tests or mock exams is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Content Ownership & intellectual Property</h2>
            <p>
              All materials on PrepForce AI—including simulated mock test questions, site layouts, logo, software, texts, and structural designs—are the property of PrepForce AI or its content suppliers and are protected by copyright laws. You may not copy, extract, download, scrape, or republish any questions or materials for commercial distribution without written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. Prohibited Activities</h2>
            <p>
              As a user of the Site, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use automatic scripts, bots, or web scrapers to download questions from the question bank.</li>
              <li>Circumvent, disable, or interfere with security-related features of the platform.</li>
              <li>Advertise or promote external commercial services on PrepForce AI.</li>
              <li>Upload malicious code, viruses, or spam vectors to our feedback or contact forms.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Subscription & Payment Rules (Future Ready)</h2>
            <p>
              While standard mock tests and study planners are currently free, PrepForce AI reserves the right to introduce premium subscriptions, mock test packages, and advanced AI tutor features. All payments and subscription renewals will be processed securely, and cancellation rules will be clearly outlined upon feature release.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Limitation of Liability</h2>
            <p>
              PrepForce AI is provided on an "as is" and "as available" basis. In no event shall PrepForce AI or its team be liable for any damages (including, without limitation, damages for loss of data, profit, or due to business interruption) arising out of the use or inability to use the platform. Our mock tests are simulated; passing mock tests on our platform does not guarantee passing the official government recruitment exams.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Termination Rights</h2>
            <p>
              We reserve the right, without notice and in our sole discretion, to terminate your account or your right to use our platform, for any reason, including violation of these Terms.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
