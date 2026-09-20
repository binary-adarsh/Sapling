import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, Mail, FileText } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import ScoreRing from "../../components/ui/ScoreRing";
import Button from "../../components/ui/Button";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function CandidateDetails() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [resumeRes, checkRes] = await Promise.all([
          api.get(`/recruiter/candidate-resumes/${resumeId}`),
          api.get(`/recruiter/shortlisted/check/${resumeId}`),
        ]);
        if (!active) return;
        setResume(resumeRes.data);
        setShortlisted(!!checkRes.data);
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't load this candidate."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [resumeId]);

  const toggleShortlist = async () => {
    setToggling(true);
    try {
      if (shortlisted) {
        await api.delete(`/recruiter/shortlisted/${resumeId}`);
        setShortlisted(false);
        toast.success("Removed from shortlist.");
      } else {
        await api.post(`/recruiter/shortlisted/${resumeId}`);
        setShortlisted(true);
        toast.success("Candidate shortlisted.");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update shortlist."));
    } finally {
      setToggling(false);
    }
  };

  return (
    <AppShell>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {loading ? (
        <SkeletonLine width="50%" height={200} />
      ) : !resume ? (
        <p className="text-sm text-[var(--color-ink-soft)]">This candidate couldn't be found.</p>
      ) : (
        <div className="paper-panel rounded-2xl p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <ScoreRing value={resume.score ?? 0} tone="gold" />
              <div>
                <h1 className="font-display text-2xl text-[var(--color-ink)]">{resume.user?.name || "Candidate"}</h1>
                <p className="text-sm text-[var(--color-ink-faint)] flex items-center gap-1.5 mt-1">
                  <Mail size={13} /> {resume.user?.email}
                </p>
                <p className="text-xs text-[var(--color-ink-faint)] flex items-center gap-1.5 mt-1">
                  <FileText size={12} /> {resume.fileName}
                </p>
              </div>
            </div>
            <Button variant={shortlisted ? "primary" : "ghost"} loading={toggling} onClick={toggleShortlist}>
              <Star size={15} fill={shortlisted ? "currentColor" : "none"} /> {shortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          </div>

          <div className="my-7 border-t border-[var(--color-line)]" />

          <h2 className="font-display text-lg text-[var(--color-ink)] mb-3">AI analysis</h2>
          <div className="text-sm leading-relaxed text-[var(--color-ink-soft)] whitespace-pre-wrap">
            {resume.aiAnalysis || "No analysis available for this resume."}
          </div>
        </div>
      )}
    </AppShell>
  );
}
