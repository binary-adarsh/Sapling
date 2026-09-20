import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MessageSquare, Code2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

const statusTone = { APPLIED: "teal", SHORTLISTED: "gold", REJECTED: "coral", HIRED: "teal" };

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/applications/my");
        setApps(data || []);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load your applications."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <PageHeader eyebrow="Track progress" title="Your applications" description="Every role you've applied to, and where it stands." />

      {loading ? (
        <SkeletonRows rows={4} />
      ) : apps.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Browse open roles and apply to start your first assessment."
            action={
              <Link to="/jobs" className="btn-shimmer rounded-full bg-[var(--color-gold)] px-5 py-2 text-sm font-medium text-[var(--color-ink)]">
                Browse jobs
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="paper-panel rounded-2xl p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="font-display text-lg text-[var(--color-ink)]">{app.job?.title}</p>
                    <Badge tone={statusTone[app.status] || "neutral"}>{app.status || "APPLIED"}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-ink-faint)] mt-1">
                    Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""} using {app.resume?.fileName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    to={`/jobs/${app.job?.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                  >
                    <ExternalLink size={13} /> Job details
                  </Link>
                  <Link
                    to={`/interview?applicationId=${app.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs text-[var(--color-paper)]"
                  >
                    <MessageSquare size={13} /> Interview
                  </Link>
                  <Link
                    to={`/coding?applicationId=${app.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-ink)]"
                  >
                    <Code2 size={13} /> Coding
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
