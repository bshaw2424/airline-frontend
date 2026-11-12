import { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import useDestinationFavorites from "../useDestinationFavorites";

function AirportCard({ airport, saveButton }) {
  return (
    <div className="airline-drawer__item border rounded-3 p-2 p-md-3 h-100">
      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
        <strong>{airport.city || airport.name}</strong>

        {airport.airport_code && (
          <span className="badge bg-light text-dark border">
            {airport.airport_code}
          </span>
        )}
      </div>

      <div className="d-flex align-items-center justify-content-between gap-2">
        <p className="text-muted small mb-0">{airport.airport_name}</p>
        {saveButton && <div className="flex-shrink-0">{saveButton}</div>}
      </div>
    </div>
  );
}

export default function AirlineDrawer({ airline, onClose }) {
  const [showAllAirports, setShowAllAirports] = useState(false);
  const { favoritesError, renderSaveButton } = useDestinationFavorites();

  if (!airline) {
    return null;
  }

  const matchingAirports = airline.matchingAirports ?? [];

  return (
    <aside className="airline-drawer container my-4">
      <div className="border rounded-3 shadow-sm bg-white overflow-hidden">
        {/* Drawer header */}
        <header className="d-flex align-items-start justify-content-between gap-3 p-3 p-md-4 border-bottom">
          <div>
            <h2 className="fs-4 fw-semibold mb-2">{airline.name}</h2>

            <p className="text-muted mb-0">
              {airline.matchingAirportCount}{" "}
              {airline.matchingAirportCount === 1
                ? "matching airport"
                : "matching airports"}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            onClick={onClose}
            aria-label="Close airline destinations"
            style={{ width: "38px", height: "38px" }}
          >
            <IoMdClose size="1.2rem" />
          </button>
        </header>

        {/* Airport lists */}
        <div className="p-3 p-md-4">
          {favoritesError && (
            <p className="text-danger" role="alert">
              {favoritesError}
            </p>
          )}

          {/* Mobile: first five airports */}
          <div className="d-md-none">
            <ul className="list-unstyled d-grid gap-3 mb-0">
              {matchingAirports.slice(0, 5).map((airport, index) => (
                <li key={`${airline.id}-${airport.airport_code}-${index}`}>
                  <AirportCard
                    airport={airport}
                    saveButton={renderSaveButton(airport)}
                  />
                </li>
              ))}
            </ul>

            {/* Expandable additional airports */}
            {matchingAirports.length > 5 && (
              <>
                <div
                  id="airline-extra-airports"
                  className={`airline-drawer__expandable ${
                    showAllAirports ? "is-open" : ""
                  }`}
                  aria-hidden={!showAllAirports}
                >
                  <div className="airline-drawer__expandable-inner">
                    <ul className="list-unstyled d-grid gap-3 mb-0 pt-3">
                      {matchingAirports.slice(5).map((airport, index) => (
                        <li
                          key={`${airline.id}-${airport.airport_code}-${index + 5}`}
                        >
                          <AirportCard
                            airport={airport}
                            saveButton={renderSaveButton(
                              airport,
                              showAllAirports ? undefined : -1,
                            )}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={() => setShowAllAirports(prev => !prev)}
                    aria-expanded={showAllAirports}
                    aria-controls="airline-extra-airports"
                  >
                    {showAllAirports
                      ? "Show fewer airports"
                      : `Show all ${matchingAirports.length} airports`}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tablet and desktop: all airports */}
          <ul className="row g-3 justify-content-center list-unstyled mb-0 d-none d-md-flex">
            {matchingAirports.map((airport, index) => (
              <li
                key={`${airline.id}-${airport.airport_code}-${index}`}
                className={
                  matchingAirports.length === 1
                    ? "col-12"
                    : "col-12 col-md-6 col-lg-4"
                }
              >
                <AirportCard
                  airport={airport}
                  saveButton={renderSaveButton(airport)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Drawer footer */}
        {airline.slug && (
          <footer className="border-top p-3 p-md-4 d-flex justify-content-center justify-content-md-end">
            <Link to={`/airlines/${airline.slug}`} className="btn btn-primary">
              View {airline.name} Page →
            </Link>
          </footer>
        )}
      </div>
    </aside>
  );
}
