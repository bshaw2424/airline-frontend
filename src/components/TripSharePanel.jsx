import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TripSharePanel({ tripId }) {
  const [active, setActive] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const endpoint = `/api/trips/${tripId}/share`;

  useEffect(() => {
    const controller = new AbortController();

    api
      .get(endpoint, { signal: controller.signal })
      .then(({ data }) => setActive(data.active))
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Unable to check sharing status.");
        }
      });

    return () => controller.abort();
  }, [endpoint]);

  async function updateSharing() {
    setBusy(true);
    setError("");
    setCopied(false);

    try {
      if (active) {
        await api.delete(endpoint);
        setActive(false);
        setShareUrl("");
      } else {
        const { data } = await api.post(endpoint);
        setShareUrl(`${window.location.origin}/shared-itinerary/${data.token}`);
        setActive(true);
      }
    } catch (error) {
      if (!active && error.response?.status === 409) setActive(true);

      setError(error.response?.data?.message || "Unable to update sharing.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    setError("");

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setError("Select and copy the link from the text field.");
    }
  }

  return (
    <section className="border rounded p-3 mb-4">
      <h2 className="h5">Share itinerary</h2>
      <p>
        Anyone with the link can view the trip name and stops in order. Notes,
        saved ideas, photos, and videos stay private.
      </p>

      {active === null && !error && (
        <p role="status">Checking sharing status…</p>
      )}
      {error && (
        <p className="text-danger" role="alert">
          {error}
        </p>
      )}

      {shareUrl && (
        <div className="mb-3">
          <input
            className="form-control mb-2"
            aria-label="Itinerary share link"
            value={shareUrl}
            readOnly
            onFocus={event => event.currentTarget.select()}
          />
          <div className="d-grid d-xl-flex align-items-xl-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              disabled={busy}
              onClick={copyLink}
            >
              Copy link
            </button>
            {copied && <span role="status">Link copied.</span>}
          </div>
        </div>
      )}

      {active && !shareUrl && (
        <p>A link is active. Revoke it if you need to create a new one.</p>
      )}

      {active !== null && (
        <button
          type="button"
          className={`btn ${active ? "btn-outline-danger btn-sm" : "btn-primary"}`}
          disabled={busy}
          onClick={updateSharing}
        >
          {busy ? "..." : active ? "Close" : "Share Itinerary"}
        </button>
      )}
    </section>
  );
}
