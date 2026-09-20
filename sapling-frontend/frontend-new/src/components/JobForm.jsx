import { useState } from "react";
import Button from "./ui/Button";
import Input, { Field, Textarea } from "./ui/Input";

export default function JobForm({ initial, onSubmit, submitLabel = "Post job" }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    skills: initial?.skills || "",
    experience: initial?.experience || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Give the role a title.";
    if (!form.description.trim() || form.description.trim().length < 20)
      next.description = "Add a description (at least 20 characters) so candidates and AI scoring have enough to work with.";
    if (!form.skills.trim()) next.skills = "List a few key skills, comma separated.";
    if (!form.experience.trim()) next.experience = "Add an experience level, e.g. 2-4 years.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="paper-panel max-w-2xl rounded-2xl p-7 space-y-5">
      <Field label="Job title" error={errors.title}>
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Senior Backend Engineer" error={errors.title} />
      </Field>

      <Field label="Description" error={errors.description} hint="This is what candidates and the AI scoring model both read.">
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={8}
          placeholder="Responsibilities, what success looks like, team context…"
          error={errors.description}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Key skills" error={errors.skills} hint="Comma separated">
          <Input name="skills" value={form.skills} onChange={handleChange} placeholder="Java, Spring Boot, PostgreSQL" error={errors.skills} />
        </Field>
        <Field label="Experience level" error={errors.experience}>
          <Input name="experience" value={form.experience} onChange={handleChange} placeholder="2-4 years" error={errors.experience} />
        </Field>
      </div>

      <Button type="submit" loading={saving} size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
