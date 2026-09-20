import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Briefcase, Users, Pencil, Trash2, Power } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/jobs");
      setJobs(data || []);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't load your jobs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (job) => {
    setTogglingId(job.id);
    try {
      const { data } = await api.patch(`/jobs/${job.id}/status`);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? data : j)));
      toast.success(data.active ? "Job is now live." : "Job paused.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update job status."));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/jobs/${toDelete}`);
      setJobs((prev) => prev.filter((j) => j.id !== toDelete));
      toast.success("Job deleted.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete this job."));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Hiring"
        title="Your job postings"
        description="Create roles, control visibility, and jump into applicants."
        actions={
          <Button onClick={() => navigate("/recruiter/create-job")}>
            <Plus size={16} /> New job
          </Button>
        }
      />

      {loading ? (
        <SkeletonRows rows={4} />
      ) : jobs.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first listing to start receiving applications."
            action={
              <Button onClick={() => navigate("/recruiter/create-job")}>
                <Plus size={16} /> Post a job
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="paper-panel lift-hover rounded-2xl p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Link to={`/recruiter/jobs/${job.id}`} className="font-display text-lg text-[var(--color-ink)] hover:underline underline-offset-4">
                      {job.title}
                    </Link>
                    <Badge tone={job.active ? "teal" : "neutral"}>{job.active ? "Active" : "Paused"}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-ink-faint)] mt-1 line-clamp-1">{job.skills}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs text-[var(--color-paper)]"
                  >
                    <Users size={13} /> Applicants
                  </Link>
                  <button
                    onClick={() => toggleStatus(job)}
                    disabled={togglingId === job.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-ink)] disabled:opacity-50"
                  >
                    <Power size={13} /> {job.active ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                    className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
                    aria-label="Edit job"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setToDelete(job.id)}
                    className="text-[var(--color-ink-faint)] hover:text-[var(--color-coral)]"
                    aria-label="Delete job"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete this job?"
        description="Applicants and their assessment history for this job will remain on record, but the listing will be removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </AppShell>
  );
}
