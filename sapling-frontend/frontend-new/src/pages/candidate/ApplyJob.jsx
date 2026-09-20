import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [jobsRes, resumesRes, checkRes] = await Promise.all([
          api.get("/jobs/active"),
          api.get("/resume"),
          api.get(`/applications/check/${id}`),
        ]);
        if (!active) return;
        const found = (jobsRes.data || []).find((j) => String(j.id) === String(id));
        setJob(found || null);
        setResumes(resumesRes.data || []);
        if (resumesRes.data?.length) setSelectedResume(resumesRes.data[0].id);
        if (checkRes.data) {
          toast("You've already applied to this role.");
          navigate(`/jobs/${id}`, { replace: true });
        }
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load this application."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleApply = async () => {
    if (!selectedResume) {
      toast.error("Select a resume first.");
      return;
    }
    setApplying(true);
    try {
      const params = new URLSearchParams({ jobId: id, resumeId: selectedResume });
      const { data } = await api.post("/applications/apply", params);
      setApplied(data);
      toast.success("Application submitted!");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't submit your application."));
    } finally {
      setApplying(false);
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

      {loading ? (
        <div className="paper-panel rounded-2xl p-8 space-y-4 max-w-xl">
          <SkeletonLine width="50%" height={24} />
          <SkeletonLine width="100%" height={60} />
        </div>
      ) : applied ? (
        <div className="paper-panel mx-auto max-w-lg rounded-2xl p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">Application submitted</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            You've applied to {job?.title}. When you're ready, start your AI interview.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={`/interview?applicationId=${applied.id}`}
              className="inline-flex items-center gap-2 btn-shimmer rounded-full bg-[var(--color-gold)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)]"
            >
              <Sparkles size={15} /> Start interview
            </Link>
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] px-5 py-2.5 text-sm text-[var(--color-ink)]"
            >
              View applications
            </Link>
          </div>
        </div>
      ) : !job ? (
        <div className="paper-panel rounded-2xl p-10 text-center text-[var(--color-ink-soft)]">
          This job is no longer available.
        </div>
      ) : (
        <div className="paper-panel mx-auto max-w-xl rounded-2xl p-8">
          <p className="text-sm text-[var(--color-teal-deep)] font-medium">Applying to</p>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mt-1">{job.title}</h1>

          <p className="mt-6 text-sm font-medium text-[var(--color-ink)] mb-3">Choose a resume to submit</p>
          {resumes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No resumes uploaded yet"
              description="Upload a resume first so recruiters can review your fit."
              action={
                <Link to="/resumes" className="btn-shimmer rounded-full bg-[var(--color-gold)] px-5 py-2 text-sm font-medium text-[var(--color-ink)]">
                  Upload a resume
                </Link>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {resumes.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                    String(selectedResume) === String(r.id)
                      ? "border-[var(--color-teal)] bg-[var(--color-teal-soft)]"
                      : "border-[var(--color-line-strong)] hover:border-[var(--color-ink-faint)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resume"
                      checked={String(selectedResume) === String(r.id)}
                      onChange={() => setSelectedResume(r.id)}
                      className="accent-[var(--color-teal)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{r.fileName}</p>
                      <p className="text-xs text-[var(--color-ink-faint)]">Score: {r.score ?? "—"}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {resumes.length > 0 && (
            <Button className="w-full mt-6" size="lg" loading={applying} onClick={handleApply}>
              Submit application
            </Button>
          )}
        </div>
      )}
    </AppShell>
  );
}
