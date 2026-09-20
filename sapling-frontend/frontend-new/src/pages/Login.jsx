import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/ui/Button";
import Input, { Field } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      toast.success("Welcome back!");
      const from = location.state?.from;
      if (from) {
        navigate(from);
      } else {
        navigate(user.role === "RECRUITER" ? "/recruiter/dashboard" : "/dashboard");
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Pick up right where the last round left off."
      subtitle="Resume scores, interview history, and open applications are all waiting for you."
    >
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        New to Sapling?{" "}
        <Link to="/register" className="font-medium text-[var(--color-teal)] underline underline-offset-4">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Email address">
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="pl-10"
              required
              autoFocus
            />
          </div>
        </Field>

        <Field label="Password">
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {error && (
          <div className="rounded-lg bg-[var(--color-coral-soft)] px-3.5 py-2.5 text-sm text-[var(--color-coral)]">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
