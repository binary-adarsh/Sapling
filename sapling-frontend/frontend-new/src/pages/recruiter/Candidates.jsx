import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, Star, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import ScoreRing from "../../components/ui/ScoreRing";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function Candidates() {
  const [resumes, setResumes] = useState([]);
  const [shortlisted, setShortlisted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [resumesRes, shortlistedRes] = await Promise.all([
          api.get("/recruiter/candidate-resumes"),
          api.get("/recruiter/shortlisted"),
        ]);
        setResumes(resumesRes.data || []);
        setShortlisted(new Set((shortlistedRes.data || []).map((s) => s.resume?.id)));
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load candidates."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleShortlist = async (resumeId) => {
    setTogglingId(resumeId);
    const isShortlisted = shortlisted.has(resumeId);
    try {
      if (isShortlisted) {
        await api.delete(`/recruiter/shortlisted/${resumeId}`);
        setShortlisted((prev) => {
          const next = new Set(prev);
          next.delete(resumeId);
          return next;
        });
      } else {
        await api.post(`/recruiter/shortlisted/${resumeId}`);
        setShortlisted((prev) => new Set(prev).add(resumeId));
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update shortlist."));
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter(
      (r) => r.user?.name?.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q) || r.fileName?.toLowerCase().includes(q)
    );
  }, [resumes, query]);

  return (
    <AppShell>
      <PageHeader eyebrow="Talent pool" title="All candidates" description="Every resume submitted across the platform, scored by AI." />

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, or file" className="pl-10" />
      </div>

      {loading ? (
        <SkeletonRows rows={4} />
      ) : filtered.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState icon={Users} title="No candidates found" description="Try a different search, or check back once candidates apply." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((resume) => (
            <div key={resume.id} className="paper-panel lift-hover rounded-2xl p-4 flex items-center gap-4">
              <ScoreRing value={resume.score ?? 0} size={56} stroke={6} tone="teal" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-ink)] truncate">{resume.user?.name || "Candidate"}</p>
                <p className="text-xs text-[var(--color-ink-faint)] truncate">{resume.user?.email}</p>
              </div>
              <Link
                to={`/recruiter/candidate/${resume.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-ink)] shrink-0"
              >
                <ExternalLink size={13} /> View
              </Link>
              <button
                onClick={() => toggleShortlist(resume.id)}
                disabled={togglingId === resume.id}
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
                  shortlisted.has(resume.id)
                    ? "border-[var(--color-gold)] bg-[var(--color-gold-soft)] text-[var(--color-gold-deep)]"
                    : "border-[var(--color-line-strong)] text-[var(--color-ink-faint)] hover:border-[var(--color-gold)]"
                }`}
                aria-label="Toggle shortlist"
              >
                <Star size={15} fill={shortlisted.has(resume.id) ? "currentColor" : "none"} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
