import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import CandidateDashboard from "./pages/candidate/Dashboard";
import Resumes from "./pages/candidate/Resumes";
import Jobs from "./pages/candidate/Jobs";
import JobDetails from "./pages/candidate/JobDetails";
import ApplyJob from "./pages/candidate/ApplyJob";
import Applications from "./pages/candidate/Applications";
import Interview from "./pages/candidate/Interview";
import Coding from "./pages/candidate/Coding";
import CandidateSettings from "./pages/candidate/Settings";

import RecruiterDashboard from "./pages/recruiter/Dashboard";
import MyJobs from "./pages/recruiter/MyJobs";
import CreateJob from "./pages/recruiter/CreateJob";
import EditJob from "./pages/recruiter/EditJob";
import RecruiterJobDetails from "./pages/recruiter/JobDetails";
import JobApplicants from "./pages/recruiter/JobApplicants";
import Candidates from "./pages/recruiter/Candidates";
import CandidateDetails from "./pages/recruiter/CandidateDetails";
import Shortlisted from "./pages/recruiter/Shortlisted";
import AIMatching from "./pages/recruiter/AIMatching";
import RecruiterSettings from "./pages/recruiter/Settings";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return <Navigate to={user.role === "RECRUITER" ? "/recruiter/dashboard" : "/dashboard"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Candidate */}
      <Route path="/dashboard" element={<ProtectedRoute role="CANDIDATE"><CandidateDashboard /></ProtectedRoute>} />
      <Route path="/resumes" element={<ProtectedRoute role="CANDIDATE"><Resumes /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute role="CANDIDATE"><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute role="CANDIDATE"><JobDetails /></ProtectedRoute>} />
      <Route path="/jobs/:id/apply" element={<ProtectedRoute role="CANDIDATE"><ApplyJob /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute role="CANDIDATE"><Applications /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute role="CANDIDATE"><Interview /></ProtectedRoute>} />
      <Route path="/coding" element={<ProtectedRoute role="CANDIDATE"><Coding /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute role="CANDIDATE"><CandidateSettings /></ProtectedRoute>} />

      {/* Recruiter */}
      <Route path="/recruiter/dashboard" element={<ProtectedRoute role="RECRUITER"><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute role="RECRUITER"><MyJobs /></ProtectedRoute>} />
      <Route path="/recruiter/create-job" element={<ProtectedRoute role="RECRUITER"><CreateJob /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/edit/:id" element={<ProtectedRoute role="RECRUITER"><EditJob /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:id" element={<ProtectedRoute role="RECRUITER"><RecruiterJobDetails /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:id/applicants" element={<ProtectedRoute role="RECRUITER"><JobApplicants /></ProtectedRoute>} />
      <Route path="/recruiter/candidates" element={<ProtectedRoute role="RECRUITER"><Candidates /></ProtectedRoute>} />
      <Route path="/recruiter/candidate/:resumeId" element={<ProtectedRoute role="RECRUITER"><CandidateDetails /></ProtectedRoute>} />
      <Route path="/recruiter/shortlisted" element={<ProtectedRoute role="RECRUITER"><Shortlisted /></ProtectedRoute>} />
      <Route path="/recruiter/matching" element={<ProtectedRoute role="RECRUITER"><AIMatching /></ProtectedRoute>} />
      <Route path="/recruiter/settings" element={<ProtectedRoute role="RECRUITER"><RecruiterSettings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-ink)",
              color: "var(--color-paper)",
              borderRadius: "12px",
              fontSize: "14px",
              border: "1px solid var(--color-line)",
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
