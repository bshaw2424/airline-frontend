import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const airlineLogos = {
  "Delta Airlines": "/delta_logo.png",
  "Frontier Airlines": "/frontier_logo.png",
  "Southwest Airlines": "/southwest_logo.png",
  "JetBlue Airways": "/jetblue_logo.png",
  "Hawaiian Airlines": "/hawaiian_logo.png",
  "Allegiant Air": "/allegiant_logo.png",
  "Alaska Airlines": "/alaska_thumbnail2.png",
  "American Airlines": "/aa.png",
  "United Airlines": "/united_logo.png",
};

export default function AirlineCard({
  airline,
  isSaved = false,
  saveDisabled = false,
  onToggleSave,
}) {
  const destinationCount = Array.isArray(airline.destinations)
    ? airline.destinations.length
    : 0;

  const airlineLogo = airlineLogos[airline.name];

  return (
    <article className="explore-airlines__card position-relative border rounded-3 shadow-sm bg-white h-100 overflow-hidden">
      {onToggleSave && (
        <button
          type="button"
          className="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-3"
          aria-label={`Save ${airline.name}`}
          aria-pressed={isSaved}
          disabled={saveDisabled}
          onClick={() => onToggleSave(airline.slug)}
        >
          {isSaved ? (
            <FaHeart aria-hidden="true" />
          ) : (
            <FaRegHeart aria-hidden="true" />
          )}
        </button>
      )}

      <div className="p-4 d-flex flex-column text-center h-100">
        <div className="mb-3">
          {airlineLogo && (
            <img
              src={airlineLogo}
              alt={`${airline.name} logo`}
              style={{
                maxWidth: "160px",
                height: "80px",
                objectFit: "contain",
              }}
            />
          )}
        </div>

        <h3 className="h5 fw-bold mb-2">{airline.name}</h3>

        <p className="text-muted mb-4">{destinationCount} destinations</p>

        <Link
          to={`/airlines/${airline.slug}/destinations`}
          className="btn btn-outline-primary w-100 mt-auto"
        >
          View Destinations
        </Link>
      </div>
    </article>
  );
}
