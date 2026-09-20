import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, CheckCircle2, ArrowRight, Code2 } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Input";
import ScoreRing from "../../components/ui/ScoreRing";
import Celebration from "../../components/ui/Celebration";
import { SkeletonLine } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

const TOTAL_QUESTIONS = 5;

export default function Interview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get("applicationId");

  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(!!applicationId);

  const [interviewId, setInterviewId] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [completed, setCompleted] = useState(false);

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      api
        .get("/applications/my")
        .then(({ data }) => setApplications(data || []))
        .catch(() => {});
      return;
    }
    setLoadingStatus(true);
    api
      .get(`/interview/application/${applicationId}`)
      .then(({ data }) => setStatus(data))
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't check interview status.")))
      .finally(() => setLoadingStatus(false));
  }, [applicationId]);

  const startInterview = async () => {
    setStarting(true);
    setCompleted(false);
    setTranscript([]);
    setFinalScore(null);
    try {
      const { data } = await api.post(`/interview/start?applicationId=${applicationId}`);
      setInterviewId(data.interviewId);
      setQuestionNumber(data.questionNumber);
      setQuestion(data.question);
      setAnswer("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to start the interview."));
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Write an answer before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interview/${interviewId}/answer`, { answer });
      setTranscript((prev) => [
        ...prev,
        { questionNumber: data.questionNumber, question, answer, score: data.score, feedback: data.feedback },
      ]);
      if (data.completed) {
        setCompleted(true);
        setFinalScore(data.finalScore);
        setQuestion("");
        setAnswer("");
      } else {
        setQuestion(data.nextQuestion);
        setQuestionNumber(data.questionNumber + 1);
        setAnswer("");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't submit your answer."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!applicationId) {
    return (
      <AppShell>
        <PageHeader eyebrow="AI interview" title="Choose an application" description="Pick which application you'd like to interview for." />
        {applications.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            You don't have any applications yet.{" "}
            <Link to="/jobs" className="text-[var(--color-teal)] underline underline-offset-4">
              Browse open roles
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3 max-w-lg">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(`/interview?applicationId=${app.id}`)}
                className="paper-panel w-full rounded-xl p-4 text-left flex items-center justify-between hover:border-[var(--color-teal)] transition-colors"
              >
                <span className="font-medium text-[var(--color-ink)]">{app.job?.title}</span>
                <ArrowRight size={16} className="text-[var(--color-ink-faint)]" />
              </button>
            ))}
          </div>
        )}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow="AI interview" title="Adaptive technical interview" description="Five questions, generated one at a time from your resume and the role." />

      {loadingStatus ? (
        <SkeletonLine width="60%" height={40} />
      ) : interviewId === null && !completed ? (
        <div className="paper-panel max-w-xl rounded-2xl p-8 text-center">
          {status?.completed && (
            <div className="mb-6">
              <ScoreRing value={status.finalScore} max={50} size={96} tone="gold" label="/ 50" />
              <p className="text-sm text-[var(--color-ink-soft)] mt-3">
                You completed this interview on {status.completedAt ? new Date(status.completedAt).toLocaleDateString() : "a previous attempt"}.
              </p>
            </div>
          )}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]">
            <MessageSquare size={26} />
          </div>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {status?.completed ? "Take the interview again?" : "Ready when you are"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)] max-w-sm mx-auto">
            You'll answer 5 questions one at a time. Each answer is scored immediately, and the next question adapts to what you said.
          </p>
          <Button className="mt-6" size="lg" loading={starting} onClick={startInterview}>
            <Sparkles size={16} /> {status?.completed ? "Start a new attempt" : "Start interview"}
          </Button>
        </div>
      ) : completed ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="paper-panel max-w-xl rounded-2xl p-8 text-center"
        >
          <div className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center">
            <Celebration />
            <ScoreRing value={finalScore} max={50} size={100} tone="gold" label="/ 50" />
          </div>
          <h2 className="font-display text-2xl text-[var(--color-ink)] mt-5">Interview complete</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Nice work. Here's how each answer scored, out of 10.
          </p>
          <div className="mt-6 space-y-2 text-left">
            {transcript.map((t) => (
              <div key={t.questionNumber} className="rounded-lg bg-[var(--color-paper-dim)] px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-[var(--color-ink)]">Question {t.questionNumber}</span>
                <span className="text-sm font-medium text-[var(--color-teal-deep)]">{t.score}/10</span>
              </div>
            ))}
          </div>
          <Link
            to={`/coding?applicationId=${applicationId}`}
            className="mt-7 inline-flex items-center gap-2 btn-shimmer rounded-full bg-[var(--color-gold)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)]"
          >
            <Code2 size={15} /> Continue to coding round
          </Link>
        </motion.div>
      ) : (
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-2">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < questionNumber - 1
                    ? "bg-[var(--color-teal)]"
                    : i === questionNumber - 1
                    ? "bg-[var(--color-gold)]"
                    : "bg-[var(--color-line)]"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={questionNumber}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="paper-panel rounded-2xl p-7"
            >
              <p className="text-xs font-medium text-[var(--color-teal-deep)] mb-2">
                Question {questionNumber} of {TOTAL_QUESTIONS}
              </p>
              <p className="font-display text-xl text-[var(--color-ink)] leading-snug">{question}</p>

              <Textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here…"
                className="mt-5"
              />

              <div className="mt-4 flex justify-end">
                <Button loading={submitting} onClick={submitAnswer}>
                  Submit answer <ArrowRight size={15} />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {transcript.length > 0 && (
            <div className="mt-6 space-y-2">
              {transcript
                .slice()
                .reverse()
                .map((t) => (
                  <details key={t.questionNumber} className="paper-panel rounded-xl px-4 py-3 group">
                    <summary className="flex cursor-pointer items-center justify-between text-sm">
                      <span className="text-[var(--color-ink)]">Question {t.questionNumber}</span>
                      <span className="flex items-center gap-1.5 text-[var(--color-teal-deep)] font-medium">
                        <CheckCircle2 size={14} /> {t.score}/10
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{t.feedback}</p>
                  </details>
                ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
