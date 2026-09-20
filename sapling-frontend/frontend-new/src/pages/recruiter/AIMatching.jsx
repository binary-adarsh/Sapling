import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import { Select, Field } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api, { extractErrorMessage } from "../../lib/api";

export default function AIMatching() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, resumesRes] = await Promise.all([api.get("/jobs"), api.get("/recruiter/candidate-resumes")]);
        setJobs(jobsRes.data || []);
        setResumes(resumesRes.data || []);
        if (jobsRes.data?.length) setJobId(jobsRes.data[0].id);
        if (resumesRes.data?.length) setResumeId(resumesRes.data[0].id);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load matching data."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runMatch = async () => {
    if (!jobId || !resumeId) {
      toast.error("Select both a job and a resume.");
      return;
    }
    setMatching(true);
    setResult("");
    try {
      const { data } = await api.post(`/recruiter/match?jobId=${jobId}&resumeId=${resumeId}`);
      setResult(typeof data === "string" ? data : JSON.stringify(data));
    } catch (err) {
      toast.error(extractErrorMessage(err, "Matching failed."));
    } finally {
      setMatching(false);
    }
  };

  return (
    <AppShell>
      <PageHeader eyebrow="AI matching" title="Score a candidate against a role" description="Compare any resume in your pool with any job you've posted." />

      {loading ? (
        <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
      ) : jobs.length === 0 || resumes.length === 0 ? (
        <div className="paper-panel rounded-2xl p-8 text-sm text-[var(--color-ink-soft)]">
          You need at least one posted job and one candidate resume before you can run a match.
        </div>
      ) : (
        <>
          <div className="paper-panel max-w-2xl rounded-2xl p-6 mb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job">
                <Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Candidate resume">
                <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.user?.name || r.fileName}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button className="mt-5" loading={matching} onClick={runMatch}>
              <Sparkles size={16} /> Run AI match
            </Button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="paper-panel max-w-2xl rounded-2xl p-7"
              >
                <p className="text-xs font-medium text-[var(--color-teal-deep)] mb-3">Match analysis</p>
                <div className="text-sm leading-relaxed text-[var(--color-ink-soft)] whitespace-pre-wrap">{result}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AppShell>
  );
}
