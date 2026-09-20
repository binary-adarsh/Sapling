import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, ExternalLink, Users } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

function Score({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg text-[var(--color-ink)]">{value != null ? value : "—"}</p>
      <p className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">{label}</p>
    </div>
  );
}

export default function JobApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [shortlisted, setShortlisted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [resultsRes, shortlistedRes] = await Promise.all([
          api.get(`/applications/job/${id}/results`),
          api.get("/recruiter/shortlisted"),
        ]);
        if (!active) return;
        setResults(resultsRes.data || []);
        setShortlisted(new Set((shortlistedRes.data || []).map((s) => s.resume?.id)));
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load applicants."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

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
        toast.success("Removed from shortlist.");
      } else {
        await api.post(`/recruiter/shortlisted/${resumeId}`);
        setShortlisted((prev) => new Set(prev).add(resumeId));
        toast.success("Candidate shortlisted.");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update shortlist."));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AppShell>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <PageHeader eyebrow="Applicants" title={results[0]?.jobTitle || "Applicants"} description="Resume, interview, and coding scores side by side." />

      {loading ? (
        <SkeletonRows rows={4} />
      ) : results.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState icon={Users} title="No applicants yet" description="Once candidates apply, their scores will appear here." />
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.applicationId} className="paper-panel lift-hover rounded-2xl p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-ink)]">{r.candidateName}</p>
                  <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">{r.candidateEmail}</p>
                  <Badge tone="neutral" className="mt-2">
                    {r.applicationStatus || "APPLIED"}
                  </Badge>
                </div>

                <div className="flex items-center gap-5">
                  <Score label="Resume" value={r.resumeScore} />
                  <Score label="Interview" value={r.interviewScore} />
                  <Score label="Coding" value={r.codingScore} />
                  <div className="text-center">
                    <p className="font-display text-lg text-[var(--color-gold-deep)]">{r.finalScore ?? "—"}</p>
                    <p className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">Final</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    to={`/recruiter/candidate/${r.resumeId}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                  >
                    <ExternalLink size={13} /> Resume
                  </Link>
                  <button
                    onClick={() => toggleShortlist(r.resumeId)}
                    disabled={togglingId === r.resumeId}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
                      shortlisted.has(r.resumeId)
                        ? "border-[var(--color-gold)] bg-[var(--color-gold-soft)] text-[var(--color-gold-deep)]"
                        : "border-[var(--color-line-strong)] text-[var(--color-ink-faint)] hover:border-[var(--color-gold)]"
                    }`}
                    aria-label="Toggle shortlist"
                  >
                    <Star size={15} fill={shortlisted.has(r.resumeId) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
