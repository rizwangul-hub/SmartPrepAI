import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Inject SEO metadata
    updateMetaTags({
      title: "Privacy Policy | PrepForce AI",
      description: "Read the Privacy Policy of PrepForce AI. Learn how we collect, use, and safeguard your personal and account data for online test preparation.",
      keywords: "Privacy Policy, PrepForce AI Privacy, User Data Security, Google Login Privacy",
      canonicalUrl: `${window.location.origin}/privacy-policy`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy - PrepForce AI",
      "description": "Learn how PrepForce AI collects and processes user data.",
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Last Updated: June 2026
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Introduction</h2>
            <p>
              Welcome to <strong>PrepForce AI</strong>. We are committed to protecting your personal information and your right to privacy. PrepForce AI is an online test preparation platform designed to help Pakistani candidates and students prepare for force recruitments (such as ASF, PMA, Army, Navy, PAF, Police, ANF), civil exams, and academic entry tests.
            </p>
            <p>
              If you have any questions or concerns about our policy, or our practices with regards to your personal info, please contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Information Collection</h2>
            <p>
              We collect personal information that you voluntarily provide to us when registering on the website, expressing an interest in obtaining information about us or our products, or when contacting us.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> We collect names, email addresses, passwords, target exam goals, education level, city, gender, and optional profile images.</li>
              <li><strong>Google Login Integration:</strong> If you choose to register or log in using Google OAuth, we receive public profile details (your name, email address, profile image URL, and account identifier) from Google to authorize and populate your account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Cookies & Analytics</h2>
            <p>
              We use cookies and similar tracking technologies to access or store information. Cookies help us keep you logged in, analyze web traffic, and remember your display preferences (such as light or dark theme modes). We may use analytical partners (like Google Analytics) to track anonymous usage metrics to improve platform speed and test generation logic.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">4. User Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. Passwords are encrypted using robust hashing algorithms (bcrypt). While we strive to protect your data, please remember that no transmission over the internet can be guaranteed 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">5. Data Retention</h2>
            <p>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law. Mock test scores, study plans, and results are retained to show you progress history metrics in your student dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">6. Your Privacy Rights</h2>
            <p>
              You have the right to request access to your personal info, request modifications, or ask for account deletion at any time. You can edit your target exam, city, gender, and education details directly in your Profile page. If you wish to permanently delete your account, you can do so by contacting support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Contact Information</h2>
            <p>
              If you have questions or comments about this policy, you may contact us using the Contact Us form on our platform or by emailing support at <strong>support@prepforceai.online</strong>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
