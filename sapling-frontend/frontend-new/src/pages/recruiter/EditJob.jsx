import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import JobForm from "../../components/JobForm";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then(({ data }) => setJob(data))
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't load this job.")))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (form) => {
    try {
      await api.put(`/jobs/${id}`, form);
      toast.success("Job updated.");
      navigate(`/recruiter/jobs/${id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update this job."));
    }
  };

  return (
    <AppShell>
      <PageHeader eyebrow="Edit listing" title="Update this job" description="Changes apply immediately to the live listing." />
      {loading ? (
        <SkeletonLine width="50%" height={200} />
      ) : job ? (
        <JobForm initial={job} onSubmit={handleSubmit} submitLabel="Save changes" />
      ) : (
        <p className="text-sm text-[var(--color-ink-soft)]">This job couldn't be found.</p>
      )}
    </AppShell>
  );
}
