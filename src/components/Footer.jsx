import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-gray-200/50 dark:border-slate-800/60 bg-white dark:bg-slate-950 py-12 px-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left mb-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl">⚡</span>
            <span className="font-extrabold text-gray-900 dark:text-white">PrepForce AI</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            Pakistan's premier AI-powered test preparation platform. Helping aspirants crack government force recruits exams, civil services, and admissions tests with confidence.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <span onClick={() => navigate("/about-us")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">About Us</span>
            </li>
            <li>
              <span onClick={() => navigate("/our-mission")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Our Mission</span>
            </li>
            <li>
              <span onClick={() => navigate("/why-choose-us")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Why Choose Us</span>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <span onClick={() => navigate("/contact-us")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Contact Us</span>
            </li>
            <li>
              <span onClick={() => navigate("/help-center")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Help Center</span>
            </li>
            <li>
              <span onClick={() => navigate("/faq")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">FAQ</span>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <span onClick={() => navigate("/privacy-policy")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Privacy Policy</span>
            </li>
            <li>
              <span onClick={() => navigate("/terms-and-conditions")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Terms & Conditions</span>
            </li>
            <li>
              <span onClick={() => navigate("/disclaimer")} className="text-gray-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer">Disclaimer</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-gray-150 dark:border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          <span>Our Ecosystem:</span>
          <a
            href="https://forcereadyai-frontend.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 dark:text-indigo-400 hover:underline font-bold transition"
          >
            ForceReady AI (Interview Prep)
          </a>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-600">
          © {new Date().getFullYear()} PrepForce AI · Built for Pakistan's aspirants · All rights reserved
        </p>
      </div>
    </footer>
  );
}
