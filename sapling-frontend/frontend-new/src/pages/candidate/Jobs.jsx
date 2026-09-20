import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, MapPin, Clock, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/jobs/active");
        setJobs(data || []);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load open roles."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.skills?.toLowerCase().includes(q) ||
        j.recruiter?.name?.toLowerCase().includes(q)
    );
  }, [jobs, query]);

  return (
    <AppShell>
      <PageHeader eyebrow="Opportunities" title="Open roles" description="Every listing here is currently accepting applications." />

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, skill, or company"
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState icon={Briefcase} title="No roles match your search" description="Try a broader keyword, or check back later for new listings." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="paper-panel lift-hover group rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg text-[var(--color-ink)]">{job.title}</p>
                  <p className="text-sm text-[var(--color-ink-faint)] mt-0.5">
                    {job.recruiter?.name || "Hiring team"}
                  </p>
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-[var(--color-ink-faint)] group-hover:text-[var(--color-teal)] transition-colors shrink-0"
                />
              </div>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)] line-clamp-2">{job.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-faint)]">
                {job.experience && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {job.experience}
                  </span>
                )}
                {job.skills && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {job.skills.split(",").slice(0, 3).join(", ")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
