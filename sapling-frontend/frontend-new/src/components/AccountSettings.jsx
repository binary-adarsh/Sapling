import { useEffect, useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "./ui/PageHeader";
import Button from "./ui/Button";
import Input, { Field } from "./ui/Input";
import Badge from "./ui/Badge";
import { SkeletonLine } from "./ui/Skeleton";
import api, { extractErrorMessage } from "../lib/api";

export default function AccountSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/settings/profile")
      .then(({ data }) => setProfile(data))
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't load your profile.")))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Enter your current password.";
    if (form.newPassword.length < 6) next.newPassword = "Use at least 6 characters.";
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.post("/settings/change-password", form);
      toast.success("Password updated.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile and account security." />

      {loading ? (
        <SkeletonLine width="40%" height={80} />
      ) : (
        <div className="paper-panel max-w-xl rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)] text-lg font-semibold text-[var(--color-ink)]">
              {(profile?.name || profile?.email || "?").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[var(--color-ink)]">{profile?.name}</p>
              <p className="text-sm text-[var(--color-ink-faint)] flex items-center gap-1.5">
                <Mail size={12} /> {profile?.email}
              </p>
            </div>
            <Badge tone="teal" className="ml-auto">
              <ShieldCheck size={12} /> {profile?.role}
            </Badge>
          </div>
        </div>
      )}

      <div className="paper-panel max-w-xl rounded-2xl p-6">
        <h2 className="font-display text-lg text-[var(--color-ink)] mb-1">Change password</h2>
        <p className="text-sm text-[var(--color-ink-soft)] mb-5">Use at least 6 characters with a mix that's easy for you to remember but hard to guess.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current password" error={errors.currentPassword}>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
              <Input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="pl-10"
                error={errors.currentPassword}
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="New password" error={errors.newPassword}>
              <Input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
              />
            </Field>
            <Field label="Confirm" error={errors.confirmPassword}>
              <Input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </Field>
          </div>
          <Button type="submit" loading={saving}>
            Update password
          </Button>
        </form>
      </div>
    </>
  );
}
