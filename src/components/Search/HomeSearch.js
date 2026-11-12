import api from "../../api/axios";
import { useEffect, useMemo, useRef, useState } from "react";

import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import AirlineDrawer from "./AirlineDrawer";
import NoSearchResults from "./NoSearchResults";
import PopularDestinations from "./PopularDestinations";

import {
  findMatches,
  findLiveMatches,
  flattenAirlineDestinations,
  groupMatchesByAirline,
} from "./SearchHelpers";

export default function HomeSearch({ showPopularDestinations = false }) {
  // Airline data, search results, and the selected airline
  const [allAirlines, setAllAirlines] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchInfo, setSearchInfo] = useState(null);
  const [selectedAirline, setSelectedAirline] = useState(null);

  // Loading status, errors, and no-results visibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);

  const drawerRef = useRef(null);

  // Load airline data when the search component mounts
  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await api.get("/api/airlines/info");

        const airlineData = Array.isArray(response.data)
          ? response.data
          : (response.data.airlines ?? []);

        setAllAirlines(airlineData);
      } catch (err) {
        console.error("Unable to load airlines:", err);
        setLoadError(
          "Unable to load airline data. Refresh the page to try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  // Wait 800 ms before showing the no-results message
  useEffect(() => {
    if (
      search.trim().length < 2 ||
      results.length > 0 ||
      loading ||
      error.startsWith("Unable")
    ) {
      setShowNoResults(false);
      return;
    }

    setShowNoResults(false);

    const timer = setTimeout(() => {
      setShowNoResults(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [search, results, loading, error]);

  // Rebuild the searchable destination list when airline data changes
  const searchableDestinations = useMemo(() => {
    return flattenAirlineDestinations(allAirlines);
  }, [allAirlines]);

  // Scroll the airline drawer into view when a result is selected
  useEffect(() => {
    if (selectedAirline) {
      drawerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedAirline]);

  // Run the submitted search and group matching destinations by airline
  const handleSearch = event => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      setError("Enter an airport code, airport name, city, state, or country.");
      setResults([]);
      setSearchInfo(null);
      setSelectedAirline(null);
      return;
    }

    setError("");
    setSelectedAirline(null);

    const searchMatch = findMatches(searchableDestinations, query);

    if (!searchMatch) {
      setResults([]);
      setSearchInfo(null);
      setError(`No airline destinations found for "${query}".`);
      return;
    }

    const groupedResults = groupMatchesByAirline(searchMatch.matches);

    setResults(groupedResults);

    setSearchInfo({
      type: searchMatch.type,
      query,
      airlineCount: groupedResults.length,
    });
  };

  // Clear the query, results, and open drawer
  const handleClear = () => {
    setShowNoResults(false);
    setSearch("");
    setResults([]);
    setSearchInfo(null);
    setSelectedAirline(null);
    setError("");
  };

  // Update live results for typed queries and popular destination selections
  const handleSearchChange = value => {
    setSearch(value);
    setSelectedAirline(null);
    setError("");

    const query = value.trim();

    if (query.length < 2) {
      setResults([]);
      setSearchInfo(null);
      return;
    }

    const liveMatches = findLiveMatches(searchableDestinations, query);

    const groupedResults = groupMatchesByAirline(liveMatches);

    setResults(groupedResults);

    setSearchInfo(
      groupedResults.length > 0
        ? {
            type: "destination",
            query,
            airlineCount: groupedResults.length,
          }
        : null,
    );

    if (groupedResults.length === 0) {
      setError(`No airline destinations found for "${query}".`);
    } else {
      setError("");
    }
  };

  // Loading state while the airline data request is pending
  if (loading) {
    return (
      <section className="home-search">
        <div
          className="d-flex align-items-center justify-content-center gap-2 py-4"
          role="status"
        >
          <span
            className="spinner-border spinner-border-sm text-primary"
            aria-hidden="true"
          />
          <span>Loading destinations…</span>
        </div>
      </section>
    );
  }

  // Error state when the airline data request fails
  if (loadError) {
    return (
      <section className="home-search">
        <p className="alert alert-danger mt-3" role="alert">
          {loadError}
        </p>
      </section>
    );
  }

  return (
    <section className="home-search">
      {/* Search input and controls */}
      <SearchForm
        search={search}
        setSearch={handleSearchChange}
        loading={loading}
        onSubmit={handleSearch}
        onClear={handleClear}
      />

      {/* No-results message or search validation error */}
      {showNoResults ? (
        <NoSearchResults query={search.trim()} />
      ) : (
        error &&
        !error.startsWith("No airline destinations found") && (
          <p className="home-search__error text-center mt-3">{error}</p>
        )
      )}

      {/* Matching airlines and the selected airline's destination drawer */}
      <article>
        <SearchResults
          results={results}
          searchInfo={searchInfo}
          onSelectAirline={setSelectedAirline}
        />

        <div ref={drawerRef}>
          <AirlineDrawer
            airline={selectedAirline}
            onClose={() => setSelectedAirline(null)}
          />
        </div>
      </article>

      {/* Show popular destinations when enabled and the search is empty */}
      {showPopularDestinations && !search.trim() && (
        <PopularDestinations onSelectDestination={handleSearchChange} />
      )}
    </section>
  );
}
