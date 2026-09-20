import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Trash2, ChevronDown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import ScoreRing from "../../components/ui/ScoreRing";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/resume");
      setResumes(data || []);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't load your resumes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF resume.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    const toastId = toast.loading("Reading and scoring your resume…");
    try {
      await api.post("/ai/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume analyzed successfully.", { id: toastId });
      await load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Resume upload failed."), { id: toastId });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/resume/${toDelete}`);
      setResumes((prev) => prev.filter((r) => r.id !== toDelete));
      toast.success("Resume removed.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't remove that resume."));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Resumes"
        title="Your resumes"
        description="Upload a PDF resume to get an instant AI score and breakdown."
      />

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        className={`mb-10 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors ${
          dragOver ? "border-[var(--color-teal)] bg-[var(--color-teal-soft)]" : "border-[var(--color-line-strong)] hover:border-[var(--color-ink-faint)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <motion.div
          animate={uploading ? { y: [0, -6, 0] } : {}}
          transition={{ repeat: uploading ? Infinity : 0, duration: 1 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold-soft)] text-[var(--color-gold-deep)]"
        >
          <UploadCloud size={22} />
        </motion.div>
        <p className="text-sm font-medium text-[var(--color-ink)]">
          {uploading ? "Analyzing your resume…" : "Drop a PDF here, or click to browse"}
        </p>
        <p className="text-xs text-[var(--color-ink-faint)]">PDF only · scored automatically on upload</p>
      </label>

      {!loading && resumes.length > 1 && (
        <div className="paper-panel rounded-2xl p-5 mb-8">
          <p className="text-sm font-medium text-[var(--color-ink)] mb-4">Score across your uploads</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={resumes.map((r, i) => ({ name: `v${i + 1}`, score: r.score ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-ink-faint)" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: "var(--color-paper-dim)" }}
                contentStyle={{ borderRadius: 10, border: "1px solid var(--color-line)", fontSize: 13 }}
              />
              <Bar dataKey="score" fill="var(--color-teal)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <SkeletonRows rows={3} />
      ) : resumes.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState icon={FileText} title="No resumes yet" description="Upload your first resume above to see your AI score." />
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="paper-panel lift-hover rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <ScoreRing value={resume.score ?? 0} size={56} stroke={6} tone="teal" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-ink)] truncate">{resume.fileName}</p>
                  <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">
                    {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}
                  className="text-xs font-medium text-[var(--color-teal-deep)] flex items-center gap-1"
                >
                  <Sparkles size={13} /> Analysis
                  <motion.span animate={{ rotate: expandedId === resume.id ? 180 : 0 }}>
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
                <button
                  onClick={() => setToDelete(resume.id)}
                  className="text-[var(--color-ink-faint)] hover:text-[var(--color-coral)] transition-colors"
                  aria-label="Delete resume"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <AnimatePresence>
                {expandedId === resume.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-[var(--color-line)]"
                  >
                    <div className="p-5 text-sm leading-relaxed text-[var(--color-ink-soft)] whitespace-pre-wrap">
                      {resume.aiAnalysis || "No analysis available for this resume."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Remove this resume?"
        description="This will permanently delete the resume and its AI analysis."
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </AppShell>
  );
}
