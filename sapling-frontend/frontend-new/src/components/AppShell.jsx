import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  Settings,
  Users,
  Star,
  Sparkles,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const candidateNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/jobs", label: "Browse jobs", icon: Briefcase },
  { to: "/resumes", label: "My resumes", icon: FileText },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: Settings },
];

const recruiterNav = [
  { to: "/recruiter/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/recruiter/jobs", label: "My jobs", icon: Briefcase },
  { to: "/recruiter/candidates", label: "Candidates", icon: Users },
  { to: "/recruiter/shortlisted", label: "Shortlisted", icon: Star },
  { to: "/recruiter/matching", label: "AI matching", icon: Sparkles },
  { to: "/recruiter/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = user?.role === "RECRUITER" ? recruiterNav : candidateNav;
  const dashboardPath = user?.role === "RECRUITER" ? "/recruiter/dashboard" : "/dashboard";
  const initials = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  const goHome = () => {
    setMobileOpen(false);
    navigate(dashboardPath);
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <button onClick={goHome} className="flex items-center gap-2.5 px-6 pt-7 pb-8 text-left cursor-pointer">
        <Logo size={28} mono />
        <span className="font-display text-lg text-[var(--color-shell-text)]">Sapling</span>
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "text-[var(--color-shell-text)]"
                  : "text-[var(--color-shell-text)]/60 hover:bg-white/5 hover:text-[var(--color-shell-text)]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-white/10 border-l-2 border-[var(--color-gold)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon size={18} strokeWidth={1.8} className="relative" />
              <span className="relative">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link
          to="/home"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-shell-text)]/50 hover:bg-white/5 hover:text-[var(--color-shell-text)]/90 transition-colors"
        >
          <Home size={16} strokeWidth={1.8} />
          Visit Sapling homepage
        </Link>
      </div>

      <div className="border-t border-white/10 mx-3 mb-3" />

      <div className="px-3 pb-6">
        <div className="flex items-center gap-3 rounded-xl px-3.5 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gold)] text-sm font-semibold text-[var(--color-ink)]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-[var(--color-shell-text)]">{user?.name || "Your account"}</p>
            <p className="truncate text-xs text-[var(--color-shell-text)]/50">{user?.email}</p>
          </div>
          <ThemeToggle dark />
          <button
            onClick={() => logout()}
            title="Sign out"
            className="text-[var(--color-shell-text)]/50 hover:text-[var(--color-coral)] transition-colors shrink-0"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-[var(--color-shell)]">
        {SidebarContent}
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[var(--color-shell)] px-4 py-3">
        <button onClick={goHome} className="flex items-center gap-2 cursor-pointer">
          <Logo size={24} mono />
          <span className="font-display text-[var(--color-shell-text)]">Sapling</span>
        </button>
        <div className="flex items-center gap-1">
          <ThemeToggle dark />
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center text-[var(--color-shell-text)]"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute inset-y-0 left-0 w-72 bg-[var(--color-shell)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <button
                className="absolute right-4 top-6 text-[var(--color-shell-text)]/60"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
              {SidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content — transitions scoped here only, so the fixed sidebar above
          never sits inside an animated (transformed) ancestor. A transform on
          an ancestor of a `position: fixed` element redefines its containing
          block, which is what caused the sidebar to jump during route
          changes previously. */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
