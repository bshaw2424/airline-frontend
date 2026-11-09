const suggestedSearches = [
  "Arizona",
  "California",
  "Florida",
  "Hawaii",
  "Nevada",
  "Texas",
];

export default function SearchForm({
  search,
  setSearch,
  loading,
  onSubmit,
  onClear,
}) {
  return (
    <form
      className="home-search-form border shadow-sm rounded-3 p-3 p-md-4"
      onSubmit={onSubmit}
    >
      <h2 className="fs-4 fw-semibold text-center mb-3">
        Where would you like to go?
      </h2>

      <label htmlFor="destination-search" className="form-label">
        Enter a destination
      </label>

      <div className="d-flex flex-column flex-lg-row gap-2">
        <input
          id="destination-search"
          type="search"
          className="form-control flex-grow-1"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="City, airport, state, or country..."
          disabled={loading}
        />

        <div className="home-search-form__actions d-flex flex-column flex-lg-row gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>

          {search && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClear}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Suggested Searches */}
      <div className="home-search-form__suggestions d-flex flex-wrap align-items-center justify-content-center gap-2 mt-3">
        <span className="text-muted small me-1">Try:</span>

        {suggestedSearches.map(destination => (
          <button
            key={destination}
            type="button"
            className="home-search-form__chip btn btn-sm"
            onClick={() => setSearch(destination)}
            disabled={loading}
            aria-label={`Search for ${destination}`}
          >
            {destination}
          </button>
        ))}
      </div>
    </form>
  );
}
