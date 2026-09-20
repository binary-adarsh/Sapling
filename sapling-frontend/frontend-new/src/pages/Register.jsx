import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/ui/Button";
import Input, { Field } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../lib/api";

const roles = [
  {
    value: "CANDIDATE",
    label: "I'm looking for a role",
    icon: UserRound,
    desc: "Upload resumes, apply to jobs, take AI interviews.",
  },
  {
    value: "RECRUITER",
    label: "I'm hiring",
    icon: Briefcase,
    desc: "Post jobs, screen candidates, run AI matching.",
  },
];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "CANDIDATE" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Your name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      const user = await login({ email: form.email, password: form.password });
      toast.success("Account created — welcome to Sapling!");
      navigate(user.role === "RECRUITER" ? "/recruiter/dashboard" : "/dashboard");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Every hire starts as a small, honest signal."
      subtitle="Tell us which side of the table you're on — the rest of Sapling adapts around it."
    >
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Create your account</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        Already have one?{" "}
        <Link to="/login" className="font-medium text-[var(--color-teal)] underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <button
              type="button"
              key={r.value}
              onClick={() => setForm({ ...form, role: r.value })}
              className={`rounded-xl border p-3.5 text-left transition-colors ${
                form.role === r.value
                  ? "border-[var(--color-teal)] bg-[var(--color-teal-soft)]"
                  : "border-[var(--color-line-strong)] hover:border-[var(--color-ink-faint)]"
              }`}
            >
              <r.icon
                size={18}
                className={form.role === r.value ? "text-[var(--color-teal-deep)]" : "text-[var(--color-ink-faint)]"}
              />
              <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">{r.label}</p>
              <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 leading-snug">{r.desc}</p>
            </button>
          ))}
        </div>

        <Field label="Full name" error={errors.name}>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jordan Lee"
              className="pl-10"
              error={errors.name}
            />
          </div>
        </Field>

        <Field label="Email address" error={errors.email}>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="pl-10"
              error={errors.email}
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="6+ characters"
                className="pl-10 pr-9"
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm" error={errors.confirm}>
            <Input
              type={showPassword ? "text" : "password"}
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
              error={errors.confirm}
            />
          </Field>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          Create account
        </Button>

        <p className="text-xs text-[var(--color-ink-faint)] text-center">
          By continuing you agree this is a demo hiring platform for evaluation purposes.
        </p>
      </form>
    </AuthLayout>
  );
}
