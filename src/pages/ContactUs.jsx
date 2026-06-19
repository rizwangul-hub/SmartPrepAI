import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Footer from "../components/Footer.jsx";
import logoImg from "../assets/logo.png";
import axios from "axios";
import { updateMetaTags, injectJsonLdSchema } from "../utils/seo";

export default function ContactUs() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    updateMetaTags({
      title: "Contact Us | PrepForce AI Support",
      description: "Get in touch with the PrepForce AI support team. Submit your queries, bug reports, and feedback, and our team will get back to you.",
      keywords: "Contact PrepForce AI, Support Email, Help Desk, Customer Support Pakistan",
      canonicalUrl: `${window.location.origin}/contact-us`,
    });

    injectJsonLdSchema({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Us - PrepForce AI",
      "description": "Contact details and message form for PrepForce AI support.",
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Frontend validation
    if (formData.name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (formData.message.trim().length < 10) {
      setError("Message must be at least 10 characters long.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/contact", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit message. Please try again later.");
    } finally {
      setLoading(false);
    }
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
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full space-y-12">
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Contact Support & Feedback
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-450 max-w-xl mx-auto">
            Have questions about mock test keys, payments, syllabus coverage, or want to report a bug? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Support Channels</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                For fastest resolution, submit the contact form. Our agents typically respond within 24-48 business hours.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-indigo-50 dark:bg-indigo-950/50 p-2.5 rounded-xl">
                    📧
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400">Email Address</h4>
                    <a href="mailto:support@prepforceai.online" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      support@prepforceai.online
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-indigo-50 dark:bg-indigo-950/50 p-2.5 rounded-xl">
                    🏢
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400">Office Hours</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-300 font-bold">
                      Mon - Sat (9 AM - 6 PM)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-indigo-50 dark:bg-indigo-950/50 p-2.5 rounded-xl">
                    🌐
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400">Ecosystem Partner</h4>
                    <a 
                      href="https://forcereadyai-frontend.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      ForceReady AI
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6 space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                💡 Quick FAQ
              </h4>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                Looking for immediate answers regarding login errors, password resets, or how to generate a mock test? Check our dedicated <strong className="cursor-pointer text-indigo-500 hover:underline" onClick={() => navigate("/faq")}>FAQ page</strong> or the <strong className="cursor-pointer text-indigo-500 hover:underline" onClick={() => navigate("/help-center")}>Help Center</strong>.
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h3>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                🎉 Thank you! Your support message has been sent successfully. We will contact you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ali Ahmed"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="e.g. ali@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Billing Question, Mock Test Bug, Force Selection Error"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Detailed Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Describe your issue or query here in detail..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Submit Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
