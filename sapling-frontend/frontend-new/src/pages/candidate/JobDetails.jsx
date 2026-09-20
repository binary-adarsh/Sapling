import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Layers, CheckCircle2, MessageSquare, Code2 } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [jobsRes, checkRes, appsRes] = await Promise.all([
          api.get("/jobs/active"),
          api.get(`/applications/check/${id}`),
          api.get("/applications/my"),
        ]);
        if (!active) return;
        const found = (jobsRes.data || []).find((j) => String(j.id) === String(id));
        setJob(found || null);
        setHasApplied(!!checkRes.data);
        const app = (appsRes.data || []).find((a) => String(a.job?.id) === String(id));
        setApplication(app || null);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load this job."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <AppShell>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {loading ? (
        <div className="paper-panel rounded-2xl p-8 space-y-4">
          <SkeletonLine width="40%" height={28} />
          <SkeletonLine width="90%" />
          <SkeletonLine width="70%" />
        </div>
      ) : !job ? (
        <div className="paper-panel rounded-2xl p-10 text-center">
          <p className="text-[var(--color-ink-soft)]">This job is no longer available.</p>
        </div>
      ) : (
        <div className="paper-panel rounded-2xl p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-3xl text-[var(--color-ink)]">{job.title}</h1>
              <p className="text-[var(--color-ink-soft)] mt-1.5">{job.recruiter?.name || "Hiring team"}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--color-ink-faint)]">
                {job.experience && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} /> {job.experience}
                  </span>
                )}
                {job.skills && (
                  <span className="inline-flex items-center gap-1.5">
                    <Layers size={14} /> {job.skills}
                  </span>
                )}
              </div>
            </div>

            {hasApplied ? (
              <Badge tone="teal" className="shrink-0">
                <CheckCircle2 size={13} /> Applied
              </Badge>
            ) : (
              <Button onClick={() => navigate(`/jobs/${id}/apply`)} className="shrink-0">
                Apply now
              </Button>
            )}
          </div>

          <div className="my-7 border-t border-[var(--color-line)]" />

          <div className="prose-sm max-w-none text-[15px] leading-relaxed text-[var(--color-ink-soft)] whitespace-pre-wrap">
            {job.description}
          </div>

          {hasApplied && application && (
            <div className="mt-8 rounded-xl bg-[var(--color-paper-dim)] p-5">
              <p className="text-sm font-medium text-[var(--color-ink)] mb-3">Continue your assessment</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/interview?applicationId=${application.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)]"
                >
                  <MessageSquare size={14} /> AI interview
                </Link>
                <Link
                  to={`/coding?applicationId=${application.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)]"
                >
                  <Code2 size={14} /> Coding round
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
