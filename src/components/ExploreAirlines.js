import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import ExploreAirlinesHero from "./ExploreAirlinesHero";
import AirlineCard from "./AirlineCard";

export default function ExploreAirlines() {
  const airlineData = useLoaderData();
  const [search, setSearch] = useState("");

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
                <AirlineCard airline={airline} />
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
