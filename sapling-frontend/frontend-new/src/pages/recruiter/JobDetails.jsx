import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Pencil, Power, Clock, Layers } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function RecruiterJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = () => {
    api
      .get(`/jobs/${id}`)
      .then(({ data }) => setJob(data))
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't load this job.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const toggleStatus = async () => {
    setToggling(true);
    try {
      const { data } = await api.patch(`/jobs/${id}/status`);
      setJob(data);
      toast.success(data.active ? "Job is now live." : "Job paused.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update job status."));
    } finally {
      setToggling(false);
    }
  };

  return (
    <AppShell>
      <button
        onClick={() => navigate("/recruiter/jobs")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={15} /> Back to jobs
      </button>

      {loading ? (
        <SkeletonLine width="50%" height={200} />
      ) : !job ? (
        <p className="text-sm text-[var(--color-ink-soft)]">This job couldn't be found.</p>
      ) : (
        <div className="paper-panel rounded-2xl p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-3xl text-[var(--color-ink)]">{job.title}</h1>
                <Badge tone={job.active ? "teal" : "neutral"}>{job.active ? "Active" : "Paused"}</Badge>
              </div>
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
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                to={`/recruiter/jobs/${id}/applicants`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-paper)]"
              >
                <Users size={14} /> View applicants
              </Link>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/recruiter/jobs/edit/${id}`)}>
                <Pencil size={14} /> Edit
              </Button>
              <Button variant="ghost" size="sm" loading={toggling} onClick={toggleStatus}>
                <Power size={14} /> {job.active ? "Pause" : "Activate"}
              </Button>
            </div>
          </div>

          <div className="my-7 border-t border-[var(--color-line)]" />

          <div className="text-[15px] leading-relaxed text-[var(--color-ink-soft)] whitespace-pre-wrap">{job.description}</div>
        </div>
      )}
    </AppShell>
  );
}
