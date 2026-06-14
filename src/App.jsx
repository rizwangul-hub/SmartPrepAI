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

            {/* Fallbacks */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
