import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ArrowRight, CheckCircle2, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ScoreRing from "../../components/ui/ScoreRing";
import Celebration from "../../components/ui/Celebration";
import api, { extractErrorMessage } from "../../lib/api";

const difficultyTone = { EASY: "teal", MEDIUM: "gold", HARD: "coral" };

export default function Coding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get("applicationId");

  const [applications, setApplications] = useState([]);
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);

  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      api
        .get("/applications/my")
        .then(({ data }) => setApplications(data || []))
        .catch(() => {});
    }
  }, [applicationId]);

  const startSession = async () => {
    setStarting(true);
    setResult(null);
    setLastFeedback(null);
    try {
      const { data } = await api.post(`/coding/session/start?applicationId=${applicationId}`);
      setSession(data);
      const { data: q } = await api.get(`/coding/session/${data.id}/question`);
      setQuestion(q);
      setCode("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to start the coding round."));
    } finally {
      setStarting(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      toast.error("Write some code before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const params = new URLSearchParams({ code });
      const { data: submission } = await api.post(`/coding/session/${session.id}/submit`, params);
      setLastFeedback(submission);

      const wasLastQuestion = session.currentQuestion >= 3;

      if (wasLastQuestion) {
        const { data: res } = await api.get(`/coding/session/${session.id}/result`);
        setResult(res);
        setQuestion(null);
      } else {
        const nextSession = { ...session, currentQuestion: session.currentQuestion + 1 };
        setSession(nextSession);
        const { data: q } = await api.get(`/coding/session/${session.id}/question`);
        setQuestion(q);
        setCode("");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't submit your solution."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!applicationId) {
    return (
      <AppShell>
        <PageHeader eyebrow="Coding round" title="Choose an application" description="Pick which application you'd like to take the coding round for." />
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
                onClick={() => navigate(`/coding?applicationId=${app.id}`)}
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
      <PageHeader eyebrow="Coding round" title="Three randomized problems" description="Each submission is judged automatically and scored out of 10." />

      {!session && !result && (
        <div className="paper-panel max-w-xl rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]">
            <Code2 size={26} />
          </div>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">Start the coding round</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)] max-w-sm mx-auto">
            You'll get three problems, one at a time. Once you submit an answer you can't go back to it.
          </p>
          <Button className="mt-6" size="lg" loading={starting} onClick={startSession}>
            <Code2 size={16} /> Begin
          </Button>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="paper-panel max-w-xl rounded-2xl p-8 text-center">
          <div className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center">
            <Celebration />
            <ScoreRing value={result.totalScore} max={result.maxScore} size={100} tone="gold" label={`/ ${result.maxScore}`} />
          </div>
          <h2 className="font-display text-2xl text-[var(--color-ink)] mt-5">Coding round complete</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{result.percentage}% overall</p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-left">
            {[result.question1Score, result.question2Score, result.question3Score].map((s, i) => (
              <div key={i} className="rounded-lg bg-[var(--color-paper-dim)] px-3 py-2.5 text-center">
                <p className="text-xs text-[var(--color-ink-faint)]">Q{i + 1}</p>
                <p className="font-display text-lg text-[var(--color-ink)]">{s}/10</p>
              </div>
            ))}
          </div>
          <Link
            to="/applications"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-sm text-[var(--color-paper)]"
          >
            <LayoutDashboard size={15} /> Back to applications
          </Link>
        </motion.div>
      )}

      {session && question && (
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full ${
                  n < session.currentQuestion
                    ? "bg-[var(--color-teal)]"
                    : n === session.currentQuestion
                    ? "bg-[var(--color-gold)]"
                    : "bg-[var(--color-line)]"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="paper-panel rounded-2xl p-7"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[var(--color-teal-deep)]">
                  Problem {session.currentQuestion} of 3
                </p>
                {question.difficulty && (
                  <Badge tone={difficultyTone[question.difficulty?.toUpperCase()] || "neutral"}>{question.difficulty}</Badge>
                )}
              </div>
              <p className="font-display text-xl text-[var(--color-ink)]">{question.title}</p>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)] whitespace-pre-wrap leading-relaxed">
                {question.description}
              </p>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here…"
                rows={12}
                spellCheck={false}
                className="mt-5 w-full rounded-xl border border-white/10 bg-[var(--color-shell)] px-4 py-3 font-mono text-[13px] leading-relaxed text-[var(--color-shell-text)] outline-none focus:border-[var(--color-teal)]"
              />

              <div className="mt-4 flex justify-end">
                <Button loading={submitting} onClick={submitCode}>
                  Submit solution <ArrowRight size={15} />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {lastFeedback && (
            <div className="mt-5 paper-panel rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[var(--color-teal-deep)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  Previous submission scored {lastFeedback.score ?? "—"}/10
                </p>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1 whitespace-pre-wrap">{lastFeedback.feedback}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
