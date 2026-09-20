import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ExternalLink, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "../../components/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import ScoreRing from "../../components/ui/ScoreRing";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import api, { extractErrorMessage } from "../../lib/api";

export default function Shortlisted() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/recruiter/shortlisted");
      setItems(data || []);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't load your shortlist."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`/recruiter/shortlisted/${toRemove}`);
      setItems((prev) => prev.filter((s) => s.resume?.id !== toRemove));
      toast.success("Removed from shortlist.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't remove this candidate."));
    } finally {
      setRemoving(false);
      setToRemove(null);
    }
  };

  return (
    <AppShell>
      <PageHeader eyebrow="Your picks" title="Shortlisted candidates" description="The candidates you've marked as ones to watch." />

      {loading ? (
        <SkeletonRows rows={3} />
      ) : items.length === 0 ? (
        <div className="paper-panel rounded-2xl">
          <EmptyState
            icon={Star}
            title="No one shortlisted yet"
            description="Star a candidate from the applicants or candidates page to keep track of them here."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="paper-panel lift-hover rounded-2xl p-4 flex items-center gap-4">
              <ScoreRing value={item.resume?.score ?? 0} size={56} stroke={6} tone="gold" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-ink)] truncate">{item.resume?.user?.name || "Candidate"}</p>
                <p className="text-xs text-[var(--color-ink-faint)] truncate">{item.resume?.user?.email}</p>
              </div>
              <Link
                to={`/recruiter/candidate/${item.resume?.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] px-3.5 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-ink)] shrink-0"
              >
                <ExternalLink size={13} /> View
              </Link>
              <button
                onClick={() => setToRemove(item.resume?.id)}
                className="text-[var(--color-ink-faint)] hover:text-[var(--color-coral)] shrink-0"
                aria-label="Remove from shortlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toRemove}
        title="Remove from shortlist?"
        description="You can always shortlist this candidate again later."
        confirmLabel="Remove"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setToRemove(null)}
      />
    </AppShell>
  );
}
