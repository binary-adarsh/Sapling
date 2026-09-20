import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, ArrowUpRight, Sparkles } from "lucide-react";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import ScoreRing from "../../components/ui/ScoreRing";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const statusTone = {
  APPLIED: "teal",
  IN_PROGRESS: "gold",
  SHORTLISTED: "gold",
  REJECTED: "coral",
  HIRED: "teal",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get("/resume/stats"),
          api.get("/applications/my"),
        ]);
        if (!active) return;
        setStats(statsRes.data);
        setApplications(appsRes.data || []);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load your dashboard."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const firstName = (user?.name || user?.email || "there").split(" ")[0].split("@")[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${firstName}.`}
        description="Here's where your resumes and applications stand right now."
        actions={
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-paper)] hover:bg-[var(--color-teal-deep)] transition-colors"
          >
            Browse jobs <ArrowUpRight size={15} />
          </Link>
        }
      />

      {loading ? (
        <SkeletonRows rows={3} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3 mb-10">
            <div className="paper-panel lift-hover rounded-2xl p-5 flex items-center gap-4">
              <ScoreRing value={stats?.averageScore ?? 0} label="avg" tone="teal" size={72} />
              <div>
                <p className="text-sm text-[var(--color-ink-soft)]">Average resume score</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">across all uploads</p>
              </div>
            </div>
            <div className="paper-panel lift-hover rounded-2xl p-5 flex items-center gap-4">
              <ScoreRing value={stats?.bestScore ?? 0} label="best" tone="gold" size={72} />
              <div>
                <p className="text-sm text-[var(--color-ink-soft)]">Best resume score</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">your strongest version</p>
              </div>
            </div>
            <div className="paper-panel lift-hover rounded-2xl p-5 flex items-center gap-4">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-dim)]">
                <FileText size={24} className="text-[var(--color-ink-soft)]" />
              </div>
              <div>
                <p className="font-display text-2xl text-[var(--color-ink)]">{stats?.totalResumes ?? 0}</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">resumes uploaded</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-[var(--color-ink)]">Recent applications</h2>
            <Link to="/applications" className="text-sm text-[var(--color-teal)] hover:underline underline-offset-4">
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="paper-panel rounded-2xl">
              <EmptyState
                icon={Briefcase}
                title="No applications yet"
                description="Once you apply to a job, you'll be able to track its interview and coding progress here."
                action={
                  <Link
                    to="/jobs"
                    className="btn-shimmer rounded-full bg-[var(--color-gold)] px-5 py-2 text-sm font-medium text-[var(--color-ink)]"
                  >
                    Find a role
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="paper-panel lift-hover rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{app.job?.title}</p>
                    <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">
                      Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""} · Resume{" "}
                      {app.resume?.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone[app.status] || "neutral"}>{app.status || "APPLIED"}</Badge>
                    <Link
                      to={`/interview?applicationId=${app.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-teal-deep)] hover:underline underline-offset-4"
                    >
                      <Sparkles size={13} /> Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
