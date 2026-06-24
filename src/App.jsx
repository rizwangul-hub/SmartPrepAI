// src/App.jsx  – updated with all routes
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import BulkMCQUpload from "./pages/BulkMCQUpload.jsx";
import NotFound from "./pages/NotFound.jsx";
import GenerateTest from "./pages/GenerateTest.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MockTest from "./pages/MockTest.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import StudyPlan from "./pages/StudyPlan.jsx";
import Profile from "./pages/Profile.jsx";
import Certificate from "./pages/Certificate.jsx";
import SEOPage from "./pages/SEOPage.jsx";
import SEOBlogPage from "./pages/SEOBlogPage.jsx";

// Import new legal, company, and support pages
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import Disclaimer from "./pages/Disclaimer.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import OurMission from "./pages/OurMission.jsx";
import WhyChooseUs from "./pages/WhyChooseUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import FAQ from "./pages/FAQ.jsx";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Public Info & Legal Routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/our-mission" element={<OurMission />} />
            <Route path="/why-choose-us" element={<WhyChooseUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test/:testId/start"
              element={
                <ProtectedRoute>
                  <MockTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId/start"
              element={
                <ProtectedRoute>
                  <MockTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result/:resultId"
              element={
                <ProtectedRoute>
                  <ResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate/:resultId"
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-plan"
              element={
                <ProtectedRoute>
                  <StudyPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-test"
              element={
                <ProtectedRoute>
                  <GenerateTest />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bulk-upload"
              element={
                <ProtectedRoute adminOnly={true}>
                  <BulkMCQUpload />
                </ProtectedRoute>
              }
            />

            {/* Short-form redirects for sitemap paths */}
            <Route path="/about" element={<Navigate to="/about-us" replace />} />
            <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
            <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />

            {/* Programmatic SEO routes */}
            <Route path="/exams/:seoSlug" element={<SEOPage />} />
            <Route path="/blog/:slug" element={<SEOBlogPage />} />
            <Route path="/:seoSlug" element={<SEOPage />} />

            {/* Fallbacks */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
