import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-paper)] px-6 text-center"
    >
      <Logo size={40} />
      <h1 className="font-display text-5xl text-[var(--color-ink)] mt-6">Page not found</h1>
      <p className="text-[var(--color-ink-soft)] mt-3 max-w-sm">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Link
        to="/home"
        className="mt-6 inline-flex rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-sm text-[var(--color-paper)]"
      >
        Back to home
      </Link>
    </motion.div>
  );
}
