import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, Star, Sparkles, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, candidatesRes, shortlistRes] = await Promise.all([
          api.get("/jobs"),
          api.get("/recruiter/candidates"),
          api.get("/recruiter/shortlisted"),
        ]);
        setJobs(jobsRes.data || []);
        setCandidateCount((candidatesRes.data || []).length);
        setShortlistCount((shortlistRes.data || []).length);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load your dashboard."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstName = (user?.name || user?.email || "there").split(" ")[0].split("@")[0];
  const activeJobs = jobs.filter((j) => j.active).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}.`}
        description="A quick look at your open roles and talent pool."
        actions={
          <Link
            to="/recruiter/create-job"
            className="inline-flex items-center gap-2 btn-shimmer rounded-full bg-[var(--color-gold)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-deep)] hover:text-white transition-colors"
          >
            <Plus size={15} /> Post a job
          </Link>
        }
      />

      {loading ? (
        <SkeletonRows rows={3} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3 mb-10">
            <div className="paper-panel lift-hover rounded-2xl p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="font-display text-2xl text-[var(--color-ink)]">
                  {activeJobs}
                  <span className="text-sm text-[var(--color-ink-faint)] font-sans"> / {jobs.length}</span>
                </p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">active job postings</p>
              </div>
            </div>
            <div className="paper-panel lift-hover rounded-2xl p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]">
                <Users size={20} />
              </div>
              <div>
                <p className="font-display text-2xl text-[var(--color-ink)]">{candidateCount}</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">candidates in the pool</p>
              </div>
            </div>
            <div className="paper-panel lift-hover rounded-2xl p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold-soft)] text-[var(--color-gold-deep)]">
                <Star size={20} />
              </div>
              <div>
                <p className="font-display text-2xl text-[var(--color-ink)]">{shortlistCount}</p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">shortlisted candidates</p>
              </div>
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="paper-panel rounded-2xl p-5 mb-10">
              <p className="text-sm font-medium text-[var(--color-ink)] mb-4">Hiring pipeline at a glance</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Active jobs", value: activeJobs, color: "var(--color-teal)" },
                    { name: "Paused jobs", value: jobs.length - activeJobs, color: "var(--color-line-strong)" },
                    { name: "Candidates", value: candidateCount, color: "var(--color-ink-soft)" },
                    { name: "Shortlisted", value: shortlistCount, color: "var(--color-gold)" },
                  ]}
                  margin={{ left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-paper-dim)" }}
                    contentStyle={{ borderRadius: 10, border: "1px solid var(--color-line)", fontSize: 13 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {[
                      "var(--color-teal)",
                      "var(--color-line-strong)",
                      "var(--color-ink-soft)",
                      "var(--color-gold)",
                    ].map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-[var(--color-ink)]">Your jobs</h2>
            <Link to="/recruiter/jobs" className="text-sm text-[var(--color-teal)] hover:underline underline-offset-4">
              Manage all
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="paper-panel rounded-2xl">
              <EmptyState
                icon={Briefcase}
                title="No jobs posted yet"
                description="Post your first role to start receiving applications."
                action={
                  <Link to="/recruiter/create-job" className="btn-shimmer rounded-full bg-[var(--color-gold)] px-5 py-2 text-sm font-medium text-[var(--color-ink)]">
                    Post a job
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="paper-panel lift-hover rounded-xl p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <Link to={`/recruiter/jobs/${job.id}`} className="font-medium text-[var(--color-ink)] hover:underline underline-offset-4">
                        {job.title}
                      </Link>
                      <Badge tone={job.active ? "teal" : "neutral"}>{job.active ? "Active" : "Paused"}</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 line-clamp-1">{job.skills}</p>
                  </div>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-teal-deep)] hover:underline underline-offset-4 shrink-0"
                  >
                    <Sparkles size={13} /> Applicants <ArrowUpRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
