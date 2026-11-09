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
  const [allAirlines, setAllAirlines] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchInfo, setSearchInfo] = useState(null);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);

  const drawerRef = useRef(null);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/airlines/info");

        const airlineData = Array.isArray(response.data)
          ? response.data
          : (response.data.airlines ?? []);

        setAllAirlines(airlineData);
      } catch (err) {
        console.error("Unable to load airlines:", err);
        setError("Unable to load airline data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

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

  const searchableDestinations = useMemo(() => {
    return flattenAirlineDestinations(allAirlines);
  }, [allAirlines]);

  // Scroll to the selected airline's destinations
  useEffect(() => {
    if (selectedAirline) {
      drawerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedAirline]);

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

  const handleClear = () => {
    setShowNoResults(false);
    setSearch("");
    setResults([]);
    setSearchInfo(null);
    setSelectedAirline(null);
    setError("");
  };

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

  return (
    <section className="home-search">
      <SearchForm
        search={search}
        setSearch={handleSearchChange}
        loading={loading}
        onSubmit={handleSearch}
        onClear={handleClear}
      />

      {/*  error message */}
      {showNoResults ? (
        <NoSearchResults query={search.trim()} />
      ) : (
        error &&
        !error.startsWith("No airline destinations found") && (
          <p className="home-search__error text-center mt-3">{error}</p>
        )
      )}
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
      {showPopularDestinations && !search.trim() && (
        <PopularDestinations onSelectDestination={handleSearchChange} />
      )}
    </section>
  );
}
