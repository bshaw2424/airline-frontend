import { Link } from "react-router-dom";

export default function TripCard({ trip }) {
  const tripStops = trip.tripStops || [];
  const legacyDestinations = trip.destinations || [];

  // Avoid counting legacy airports already in tripStops.
  const migratedCodes = new Set(
    tripStops
      .map(stop => stop.airportCode?.trim().toUpperCase())
      .filter(Boolean),
  );

  const remainingLegacy = legacyDestinations.filter(
    code => !migratedCodes.has(code.trim().toUpperCase()),
  );

  const destinationCount = tripStops.length + remainingLegacy.length;

  return (
    <article className="card h-100 shadow-sm overflow-hidden">
      {/* Trip cover image */}
      {trip.coverImage ? (
        <img
          src={trip.coverImage}
          alt={`Cover for ${trip.name}`}
          className="card-img-top"
          style={{
            height: "210px",
            objectFit: "cover",
          }}
          loading="lazy"
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center text-white"
          style={{
            height: "210px",
            background:
              "linear-gradient(135deg, #176b87 0%, #64ccc5 55%, #dafffb 100%)",
          }}
        >
          <div className="text-center">
            <span style={{ fontSize: "3rem" }} aria-hidden="true">
              ✈️
            </span>
            <p className="fw-semibold mb-0">Your Next Adventure</p>
          </div>
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <h3 className="h5 card-title">{trip.name}</h3>

        <p className="text-muted mb-2">
          {destinationCount}{" "}
          {destinationCount === 1 ? "destination" : "destinations"}
        </p>

        {trip.startDate && (
          <p className="mb-1">
            <strong>Start:</strong> {trip.startDate.slice(0, 10)}
          </p>
        )}

        {trip.endDate && (
          <p className="mb-1">
            <strong>End:</strong> {trip.endDate.slice(0, 10)}
          </p>
        )}

        {trip.notes && <p className="card-text mt-3 mb-0">{trip.notes}</p>}

        <div className="mt-auto pt-3">
          <Link
            to={`/my-trips/${trip._id}`}
            className="btn btn-outline-primary btn-sm"
          >
            View Trip
          </Link>
        </div>
      </div>
    </article>
  );
}
