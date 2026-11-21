import { useState } from "react";
import { Link } from "react-router-dom";

export default function FeatureTips({ feature, children }) {
  const dismissedKey = `flightinrange:${feature}-tip-dismissed`;

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(dismissedKey) === "true",
  );

  if (dismissed) return null;

  function dismissTip() {
    setDismissed(true);
    localStorage.setItem(dismissedKey, "true");
  }

  return (
    <aside
      className="border rounded p-3 mb-4 shadow-sm"
      aria-label="Getting Started tip"
    >
      <p className="mb-2">{children}</p>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <Link to="/getting-started">Getting Started</Link>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={dismissTip}
        >
          Got it
        </button>
      </div>
    </aside>
  );
}
