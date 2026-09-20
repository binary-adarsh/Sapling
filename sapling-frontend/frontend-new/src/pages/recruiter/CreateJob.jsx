import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import JobForm from "../../components/JobForm";
import api, { extractErrorMessage } from "../../lib/api";

export default function CreateJob() {
  const navigate = useNavigate();

  const handleSubmit = async (form) => {
    try {
      const { data } = await api.post("/jobs", form);
      toast.success("Job posted.");
      navigate(`/recruiter/jobs/${data.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't post this job."));
    }
  };

  return (
    <AppShell>
      <PageHeader eyebrow="New listing" title="Post a job" description="Candidates will see this once it's live." />
      <JobForm onSubmit={handleSubmit} submitLabel="Post job" />
    </AppShell>
  );
}
