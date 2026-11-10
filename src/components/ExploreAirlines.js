import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ExploreAirlinesHero from "./ExploreAirlinesHero";
import AirlineCard from "./AirlineCard";

export default function ExploreAirlines() {
  const airlineData = useLoaderData();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [search, setSearch] = useState("");
  const [savedAirlines, setSavedAirlines] = useState(null);
  const [savingAirline, setSavingAirline] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    setSavedAirlines(null);
    setFavoritesError("");

    if (!isLoggedIn) return;

    let active = true;

    async function loadSavedAirlines() {
      try {
        const response = await api.get("/api/favorites/airlines");

        if (active) {
          setSavedAirlines(response.data.savedAirlines ?? []);
        }
      } catch {
        if (active) {
          setFavoritesError(
            "Unable to load saved airlines. Refresh to try again.",
          );
        }
      }
    }

    loadSavedAirlines();

    return () => {
      active = false;
    };
  }, [authLoading, isLoggedIn]);

  // Each update returns the full saved list, so submit one change at a time.
  const saveDisabled =
    authLoading || savingAirline || (isLoggedIn && savedAirlines === null);

  async function handleToggleSave(airlineSlug) {
    if (saveDisabled) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setSavingAirline(true);
    setFavoritesError("");

    try {
      const response = savedAirlines.includes(airlineSlug)
        ? await api.delete(`/api/favorites/airlines/${airlineSlug}`)
        : await api.post("/api/favorites/airlines", { airlineSlug });

      setSavedAirlines(response.data.savedAirlines ?? []);
    } catch {
      setFavoritesError("Unable to update saved airline. Please try again.");
    } finally {
      setSavingAirline(false);
    }
  }

  const airlines = Array.isArray(airlineData)
    ? airlineData
    : (airlineData?.airlines ?? []);

  const filteredAirlines = airlines.filter(airline =>
    airline.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <main className="explore-airlines">
      <ExploreAirlinesHero />

      <section className="container py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Discover Airlines</h2>
          <p className="text-muted">
            Explore {airlines.length} airlines and discover their destinations.
          </p>
        </div>

        <div className="mx-auto mb-4" style={{ maxWidth: "650px" }}>
          <label htmlFor="airline-search" className="form-label fw-semibold">
            Search by airline name
          </label>

          <input
            id="airline-search"
            type="search"
            className="form-control form-control-lg"
            placeholder="Try Delta, Southwest, or United"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        {favoritesError && (
          <p className="text-danger text-center" role="alert">
            {favoritesError}
          </p>
        )}

        {filteredAirlines.length > 0 ? (
          <div className="row g-4 justify-content-center">
            {filteredAirlines.map(airline => (
              <div
                key={airline._id || airline.slug}
                className={
                  filteredAirlines.length === 1
                    ? "col-8"
                    : "col-12 col-md-6 col-lg-4"
                }
              >
                <AirlineCard
                  airline={airline}
                  isSaved={
                    isLoggedIn &&
                    (savedAirlines?.includes(airline.slug) ?? false)
                  }
                  saveDisabled={saveDisabled}
                  onToggleSave={handleToggleSave}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <h3 className="h5">No airlines found</h3>
            <p className="text-muted">
              Try another airline name or clear your search.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
