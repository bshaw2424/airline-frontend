import { useState } from "react";

export default function AirlineDestinationsPage({ airline }) {
  // Track search text and dropdown selections.
  const [search, setSearch] = useState("");
  const [service, setService] = useState("all");
  const [location, setLocation] = useState("");

  // Ensure destinations is always an array.
  const destinations = Array.isArray(airline?.destinations)
    ? airline.destinations
    : [];

  // Support boolean values and strings such as "true".
  const isTrue = value => String(value).toLowerCase() === "true";

  // Build an alphabetical list of states and countries.
  const locations = [
    ...new Set(
      destinations.map(destination => destination.state).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  // Typing a search resets both dropdowns.
  function handleSearchChange(event) {
    setSearch(event.target.value);
    setService("all");
    setLocation("");
  }

  // Selecting a service clears search and resets location.
  function handleServiceChange(event) {
    setService(event.target.value);
    setSearch("");
    setLocation("");
  }

  // Selecting a location clears search and resets service.
  function handleLocationChange(event) {
    setLocation(event.target.value);
    setSearch("");
    setService("all");
  }

  // Reset every control to display all destinations.
  function clearFilters() {
    setSearch("");
    setService("all");
    setLocation("");
  }

  // Ignore capitalization and extra spaces when searching.
  const query = search.trim().toLowerCase();

  // Apply the active search or filter and sort results alphabetically.
  const filteredDestinations = destinations
    .filter(destination => {
      const matchesSearch = [
        destination.name,
        destination.airport_code,
        destination.airport_name,
        destination.city,
        destination.state,
      ].some(value =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );

      const international = isTrue(destination.international);

      const matchesService =
        service === "all" ||
        (service === "international" && international) ||
        (service === "domestic" && !international);

      const matchesLocation = location === "" || destination.state === location;

      return matchesSearch && matchesService && matchesLocation;
    })
    .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));

  const hasFilters = query !== "" || service !== "all" || location !== "";

  // Share service badges between desktop and mobile layouts.
  function renderService(destination) {
    return (
      <div className="d-flex flex-wrap gap-2">
        <span className="badge bg-primary">
          {isTrue(destination.international) ? "International" : "Domestic"}
        </span>

        {isTrue(destination.seasonal) && (
          <span className="badge bg-secondary">Seasonal</span>
        )}
      </div>
    );
  }

  return (
    <main className="airline-destinations-page container py-4">
      {/* Airline heading and full destination total. */}
      <header className="airline-destinations-header mb-4">
        <h1 className="fw-bold mb-2">
          {airline?.name || "Airline Destinations"}
        </h1>

        <p className="lead fw-semibold text-primary mb-2">
          {destinations.length} destinations
        </p>

        <p className="text-muted">
          Explore destinations and discover where this airline flies.
        </p>
      </header>

      {/* Each search or dropdown change resets the other two controls. */}
      <section
        className="bg-light border rounded-3 p-3 p-md-4 mb-4"
        aria-labelledby="destination-search-heading"
      >
        <h2 id="destination-search-heading" className="h5 fw-bold mb-3">
          Find a destination
        </h2>

        <div className="row g-3">
          {/* Search destination names, airport details, and locations. */}
          <div className="col-12 col-lg-6">
            <label
              htmlFor="destination-search"
              className="form-label fw-semibold"
            >
              Search destinations
            </label>

            <input
              id="destination-search"
              type="search"
              className="form-control"
              placeholder="City, airport, state, or country"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filter by domestic or international service. */}
          <div className="col-12 col-md-6 col-lg-3">
            <label
              htmlFor="destination-service"
              className="form-label fw-semibold"
            >
              Service
            </label>

            <select
              id="destination-service"
              className="form-select"
              value={service}
              onChange={handleServiceChange}
            >
              <option value="all">All destinations</option>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>

          {/* Filter by state or country. */}
          <div className="col-12 col-md-6 col-lg-3">
            <label
              htmlFor="destination-location"
              className="form-label fw-semibold"
            >
              State / Country
            </label>

            <select
              id="destination-location"
              className="form-select"
              value={location}
              onChange={handleLocationChange}
            >
              <option value="">All locations</option>

              {locations.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear the active search or filter. */}
        {hasFilters && (
          <button
            type="button"
            className="btn btn-outline-primary mt-3"
            onClick={clearFilters}
          >
            Clear search and filters
          </button>
        )}
      </section>

      {/* Destination results and current result count. */}
      <section aria-labelledby="destinations-heading">
        {filteredDestinations.length > 0 ? (
          <>
            {/* Tablet and desktop: destination table. */}
            <div className="d-none d-md-block">
              <div className="table-responsive border rounded-3">
                <table className="table table-hover align-middle mb-0">
                  <caption className="visually-hidden">
                    Destinations for {airline?.name || "this airline"} matching
                    the current search or filter.
                  </caption>

                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="px-3 py-3">
                        Destination
                      </th>
                      <th scope="col" className="py-3">
                        Airport code
                      </th>
                      <th scope="col" className="py-3">
                        Airport name
                      </th>
                      <th scope="col" className="py-3">
                        State / Country
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Service
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDestinations.map(destination => (
                      <tr key={destination._id || destination.airport_code}>
                        <th scope="row" className="px-3 py-3 fw-semibold">
                          {destination.name || destination.city || "—"}
                        </th>

                        <td className="fw-semibold text-nowrap">
                          {destination.airport_code || "—"}
                        </td>

                        <td>{destination.airport_name || "—"}</td>

                        <td>{destination.state || "—"}</td>

                        <td className="px-3">{renderService(destination)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: compact stacked results. */}
            <ul className="list-unstyled border rounded-3 overflow-hidden d-md-none">
              {filteredDestinations.map((destination, index) => (
                <li
                  key={destination._id || destination.airport_code}
                  className={`bg-white p-3 mb-0 ${
                    index < filteredDestinations.length - 1
                      ? "border-bottom"
                      : ""
                  }`}
                  style={{ cursor: "default" }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                    <h3 className="h6 fw-bold mb-0">
                      {destination.name || destination.city || "—"}
                    </h3>

                    <span className="fw-semibold text-primary text-nowrap">
                      {destination.airport_code || "—"}
                    </span>
                  </div>

                  <p className="small text-muted mb-1">
                    {destination.airport_name || "Airport name unavailable"}
                  </p>

                  <p className="small mb-2">
                    {[destination.city, destination.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  {renderService(destination)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="no-search-results mx-auto text-center p-4 p-md-5 mt-4">
            {/* Search icon, styled with the existing no-results CSS. */}
            <div className="no-search-results__icon mb-3" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </div>

            {/* Explain whether destinations are missing or no results match. */}
            <h3 className="h4 fw-bold mb-3">
              {destinations.length === 0
                ? "No destinations available yet"
                : "No destinations found"}
            </h3>

            <p className="text-muted mb-4">
              {destinations.length === 0
                ? "There are no destinations listed for this airline yet."
                : query
                  ? `We couldn’t find any destinations matching “${search.trim()}”. Try another city, airport, state, or country.`
                  : "There are no destinations matching your selected filter. Try another option or view all destinations."}
            </p>

            {/* Restore all destinations from the empty-results panel. */}
            {hasFilters && (
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={clearFilters}
              >
                View all destinations
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
