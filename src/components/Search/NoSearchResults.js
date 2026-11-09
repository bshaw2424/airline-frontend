
import { FaMapMarkedAlt } from "react-icons/fa";

export default function NoSearchResults({ query }) {
  return (
    <section
      className="no-search-results text-center mx-auto my-4 p-4 p-md-5"
      role="status"
    >
      <div className="no-search-results__icon mb-3">
        <FaMapMarkedAlt aria-hidden="true" />
      </div>

      <h2 className="fs-4 fw-bold mb-3">
        No airline destinations found
      </h2>

      <p className="text-muted mb-2">
        We couldn't find airline destination matches for{" "}
        <strong>"{query}"</strong>.
      </p>

      <p className="text-muted mb-0">
        Try searching for a nearby city, airport, or another destination.
      </p>
    </section>
  );
}
