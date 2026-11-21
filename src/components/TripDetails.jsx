import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import EditTrip from "./EditTrip";
import DestinationSearch from "./DestinationSearch";
import TripMap from "./TripMap";
import EditTripStop from "./EditTripStop";
import TripStopPhotos from "./TripStopPhotos";

const initialDestination = {
  name: "",
  type: "city",
  city: "",
  state: "",
  country: "",
  airportCode: "",
};

const destinationTypes = [
  { value: "city", label: "City" },
  { value: "airport", label: "Airport" },
  { value: "attraction", label: "Attraction" },
  { value: "region", label: "State / Region" },
  { value: "custom", label: "Custom Place" },
];

const tripIdeaGroups = [
  {
    category: "Beaches",
    ideas: [
      { id: "san-diego-mission-beach", name: "Mission Beach" },
      { id: "san-diego-la-jolla-shores", name: "La Jolla Shores" },
    ],
  },
  {
    category: "Attractions",
    ideas: [
      { id: "san-diego-balboa-park", name: "Balboa Park" },
      { id: "san-diego-uss-midway-museum", name: "USS Midway Museum" },
    ],
  },
];

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [isAddDestinationOpen, setIsAddDestinationOpen] = useState(false);
  const [isFindIdeasOpen, setIsFindIdeasOpen] = useState(false);
  const [ideaCategory, setIdeaCategory] = useState("All");
  const [savingIdeaId, setSavingIdeaId] = useState(null);
  const [saveIdeaError, setSaveIdeaError] = useState("");
  const [addDestinationError, setAddDestinationError] = useState("");
  const addDestinationButton = useRef(null);
  const [destination, setDestination] = useState(initialDestination);
  const [addingDestination, setAddingDestination] = useState(false);
  const [removingDestination, setRemovingDestination] = useState(null);
  const [destinationError, setDestinationError] = useState("");
  const [reorderingStops, setReorderingStops] = useState(false);

  const [editingStop, setEditingStop] = useState(null);
  const [savingStop, setSavingStop] = useState(false);
  const [editStopError, setEditStopError] = useState("");
  const [photoStop, setPhotoStop] = useState(null);
  const [movingIdeaId, setMovingIdeaId] = useState(null);
  const [moveIdeaError, setMoveIdeaError] = useState("");
  const [unsavingIdeaId, setUnsavingIdeaId] = useState(null);

  const isDestinationBusy =
    addingDestination ||
    removingDestination !== null ||
    reorderingStops ||
    savingStop;

  const handleStartEditStop = stop => {
    // Copy the saved values so Cancel can discard the draft.
    setEditingStop({
      id: stop.id,
      name: stop.name,
      type: stop.type,
      city: stop.city ?? "",
      state: stop.state ?? "",
      country: stop.country ?? "",
      airportCode: stop.airportCode ?? "",
    });
    setEditStopError("");
  };

  const handleEditStopChange = event => {
    const { name, value } = event.target;
    setEditingStop(previous => ({ ...previous, [name]: value }));
    setEditStopError("");
  };

  const handleCancelEditStop = () => {
    setEditingStop(null);
    setEditStopError("");
  };

  const handleSaveStop = async event => {
    event.preventDefault();

    if (!editingStop || isDestinationBusy) return;

    const { id: stopId, ...fields } = editingStop;

    setSavingStop(true);
    setEditStopError("");

    try {
      const response = await api.patch(
        `/api/trips/${id}/stops/${stopId}`,
        fields,
      );
      setTrip(response.data.trip);
      handleCancelEditStop();
    } catch (error) {
      setEditStopError(
        error.response?.data?.message || "Unable to update this destination.",
      );
    } finally {
      setSavingStop(false);
    }
  };

  const handleTripUpdated = updatedTrip => {
    setTrip(updatedTrip);
    setIsEditing(false);
  };

  const closeAddDestination = () => {
    setIsAddDestinationOpen(false);
    setDestination({ ...initialDestination });
    setAddDestinationError("");
    addDestinationButton.current?.focus();
  };

  const handleDestinationChange = e => {
    const { name, value } = e.target;

    setDestination(prev => ({
      ...prev,
      [name]: value,
    }));

    setAddDestinationError("");
  };

  const handleAddSelectedAirport = async selectedAirport => {
    if (isDestinationBusy) {
      return;
    }

    setAddingDestination(true);
    setDestinationError("");

    try {
      const response = await api.post(`/api/trips/${id}/stops`, {
        name:
          selectedAirport.airport_name ||
          selectedAirport.name ||
          selectedAirport.city,
        type: "airport",
        city: selectedAirport.city || "",
        state: selectedAirport.state || "",
        country: "",
        airportCode: selectedAirport.airport_code || "",
      });

      setTrip(response.data.trip);
    } catch (error) {
      console.error("Unable to add selected airport:", error);

      setDestinationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to add airport. Please try again.",
      );
    } finally {
      setAddingDestination(false);
    }
  };

  const handleAddDestination = async e => {
    e.preventDefault();

    if (isDestinationBusy) return;

    const name = destination.name.trim();

    if (!name || name.length > 150) {
      setAddDestinationError(
        "Destination name must be between 1 and 150 characters.",
      );
      return;
    }

    const code = destination.airportCode.trim().toUpperCase();

    if (code && !/^[A-Z0-9]{3}$/.test(code)) {
      setAddDestinationError("Airport code must contain three characters.");
      return;
    }

    setAddingDestination(true);
    setAddDestinationError("");

    try {
      const response = await api.post(`/api/trips/${id}/stops`, {
        ...destination,
        name,
        city: destination.city.trim(),
        state: destination.state.trim(),
        country: destination.country.trim(),
        airportCode: code,
      });

      setTrip(response.data.trip);
      closeAddDestination();
    } catch (error) {
      console.error("Unable to add destination:", error);

      setAddDestinationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to add destination. Please try again.",
      );
    } finally {
      setAddingDestination(false);
    }
  };

  const handleMoveStop = async (stopId, direction) => {
    if (isDestinationBusy) {
      return;
    }

    const sortedStops = [...(trip.tripStops || [])].sort(
      (a, b) => a.order - b.order,
    );

    const currentIndex = sortedStops.findIndex(stop => stop._id === stopId);
    const targetIndex = currentIndex + direction;

    if (
      currentIndex === -1 ||
      targetIndex < 0 ||
      targetIndex >= sortedStops.length
    ) {
      return;
    }

    [sortedStops[currentIndex], sortedStops[targetIndex]] = [
      sortedStops[targetIndex],
      sortedStops[currentIndex],
    ];

    const stopIds = sortedStops.map(stop => stop._id);

    setReorderingStops(true);
    setDestinationError("");

    try {
      const response = await api.put(`/api/trips/${id}/stops/reorder`, {
        stopIds,
      });

      setTrip(response.data.trip);
    } catch (error) {
      console.error("Unable to reorder destinations:", error);
      setDestinationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to reorder destinations. Please try again.",
      );
    } finally {
      setReorderingStops(false);
    }
  };

  const handleRemoveStop = async stopId => {
    if (isDestinationBusy) return;

    setRemovingDestination(stopId);
    setDestinationError("");

    try {
      const response = await api.delete(`/api/trips/${id}/stops/${stopId}`);

      setTrip(response.data.trip);
    } catch (error) {
      console.error("Unable to remove destination:", error);

      setDestinationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to remove destination.",
      );
    } finally {
      setRemovingDestination(null);
    }
  };

  const handleRemoveLegacyDestination = async code => {
    if (isDestinationBusy) return;

    setRemovingDestination(code);
    setDestinationError("");

    try {
      const response = await api.delete(
        `/api/trips/${id}/destinations/${code}`,
      );

      setTrip(response.data.trip);
    } catch (error) {
      console.error("Unable to remove airport:", error);

      setDestinationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to remove airport.",
      );
    } finally {
      setRemovingDestination(null);
    }
  };

  const handleDeleteTrip = async () => {
    if (deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/api/trips/${id}`);

      navigate("/my-trips", { replace: true });
    } catch (error) {
      console.error("Unable to delete trip:", error);

      setDeleteError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to delete your trip. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchTrip = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/api/trips/${id}`, {
          signal: controller.signal,
        });

        setTrip(response.data.trip);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Unable to fetch trip:", error);

        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to load this trip.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTrip();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="container py-4">
        <p>Loading trip...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>

        <Link to="/my-trips" className="btn btn-outline-primary">
          Back to My Trips
        </Link>
      </main>
    );
  }

  if (!trip) return null;

  const savedIdeaIds = new Set(trip.savedIdeas ?? []);
  const savedIdeas = tripIdeaGroups.flatMap(({ category, ideas }) =>
    ideas
      .filter(idea => savedIdeaIds.has(idea.id))
      .map(idea => ({ ...idea, category })),
  );

  const tripStops = trip.tripStops || [];
  const legacyDestinations = trip.destinations || [];

  // Identify legacy airport codes already represented
  // by flexible trip stops.
  const migratedAirportCodes = new Set(
    tripStops
      .map(stop => stop.airportCode?.trim().toUpperCase())
      .filter(Boolean),
  );

  // Only display legacy destinations that have not
  // already been migrated into tripStops.
  const remainingLegacyDestinations = legacyDestinations.filter(
    code => !migratedAirportCodes.has(code.trim().toUpperCase()),
  );

  // Build one itinerary containing flexible stops
  // and any remaining legacy destinations.
  const itineraryStops = [
    ...tripStops
      .map(stop => ({
        ...stop,
        id: stop._id,
        isLegacy: false,
      }))
      .sort((a, b) => a.order - b.order),

    ...remainingLegacyDestinations.map(code => ({
      id: `legacy-${code}`,
      name: code,
      type: "airport",
      airportCode: code,
      isLegacy: true,
    })),
  ];

  // Count only destinations actually displayed.
  const destinationCount = itineraryStops.length;

  const handleMoveIdea = async ideaId => {
    setMovingIdeaId(ideaId);
    setMoveIdeaError("");

    try {
      const { data } = await api.post(`/api/trips/${id}/ideas/${ideaId}/move`);

      setTrip(currentTrip =>
        currentTrip?._id === id ? data.trip : currentTrip,
      );
    } catch (error) {
      setMoveIdeaError(
        error.response?.data?.message || "Unable to move this idea.",
      );
    } finally {
      setMovingIdeaId(null);
    }
  };

  const handleUnsaveIdea = async ideaId => {
    setUnsavingIdeaId(ideaId);
    setMoveIdeaError("");

    try {
      const { data } = await api.delete(`/api/trips/${id}/ideas/${ideaId}`);

      setTrip(currentTrip =>
        currentTrip?._id === id
          ? { ...currentTrip, savedIdeas: data.savedIdeas }
          : currentTrip,
      );
    } catch (error) {
      setMoveIdeaError(
        error.response?.data?.message || "Unable to unsave this idea.",
      );
    } finally {
      setUnsavingIdeaId(null);
    }
  };

  const handleSaveIdea = async ideaId => {
    setSavingIdeaId(ideaId);
    setSaveIdeaError("");

    try {
      const { data } = await api.post(`/api/trips/${id}/ideas`, { ideaId });

      setTrip(currentTrip =>
        currentTrip?._id === id
          ? { ...currentTrip, savedIdeas: data.savedIdeas }
          : currentTrip,
      );
    } catch (error) {
      setSaveIdeaError(
        error.response?.data?.message || "Unable to save this idea.",
      );
    } finally {
      setSavingIdeaId(null);
    }
  };

  return (
    <main className="container py-4">
      <style>{`
        .trip-add-destination-panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 220ms ease;
        }

        .trip-add-destination-panel[aria-hidden="false"] {
          grid-template-rows: 1fr;
        }

        @media (prefers-reduced-motion: reduce) {
          .trip-add-destination-panel {
            transition: none;
          }
        }
      `}</style>

      <Link to="/my-trips" className="btn btn-outline-secondary btn-sm mb-4">
        &larr; Back to My Trips
      </Link>

      <section className="border rounded-3 p-4">
        {/* Scenic trip cover image */}
        <div
          className="rounded-3 overflow-hidden mb-4"
          style={{
            height: "clamp(200px, 35vw, 360px)",
            background:
              "linear-gradient(135deg, #0d6e7a 0%, #198f9c 55%, #79c9c5 100%)",
          }}
        >
          {trip.coverImage ? (
            <img
              src={trip.coverImage}
              alt={`${trip.name} cover`}
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-white text-center p-3">
              <span aria-hidden="true" style={{ fontSize: "3rem" }}>
                ✈️
              </span>
              <h2 className="h4 fw-bold mt-2 mb-1">Your Next Adventure</h2>
              <p className="mb-0">Start exploring your destinations</p>
            </div>
          )}
        </div>

        {/* Trip heading and actions */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
          <h1 className="fw-bold mb-0">{trip.name}</h1>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setIsEditing(prev => !prev);
                setShowDeleteConfirm(false);
                setDeleteError("");
              }}
              disabled={deleting}
            >
              {isEditing ? "Cancel Edit" : "Edit Trip"}
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                setShowDeleteConfirm(true);
                setIsEditing(false);
                setDeleteError("");
              }}
              disabled={deleting || showDeleteConfirm}
            >
              Delete Trip
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="alert alert-danger" role="alert">
            <h2 className="h6">Delete this trip?</h2>

            <p>
              Are you sure you want to delete <strong>{trip.name}</strong>? This
              action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-danger" role="alert">
                {deleteError}
              </p>
            )}

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteTrip}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Trip"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError("");
                }}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit trip */}
        {isEditing && (
          <div className="border rounded-3 p-3 mb-4">
            <h2 className="h5 mb-3">Edit Trip</h2>

            <EditTrip trip={trip} onTripUpdated={handleTripUpdated} />
          </div>
        )}

        {/* Trip information */}
        <div className="mt-3">
          {trip.startDate && (
            <p>
              <strong>Start:</strong> {trip.startDate.slice(0, 10)}
            </p>
          )}

          {trip.endDate && (
            <p>
              <strong>End:</strong> {trip.endDate.slice(0, 10)}
            </p>
          )}

          {trip.notes && (
            <div className="mt-3">
              <h2 className="h5">Notes</h2>
              <p className="mb-0">{trip.notes}</p>
            </div>
          )}
        </div>

        {/* Trip destinations */}
        <section className="border-top mt-4 pt-4">
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h5 mb-0">Trip Destinations</h2>

            <span className="badge text-bg-secondary">{destinationCount}</span>
          </div>

          {/* Search existing airports */}
          <div className="mb-4">
            <DestinationSearch
              mode="trip"
              onSelect={handleAddSelectedAirport}
              disabled={isDestinationBusy}
            />
          </div>

          {itineraryStops.length > 0 && <TripMap stops={itineraryStops} />}

          <div className="mb-4 d-grid gap-2 d-lg-flex">
            <button
              ref={addDestinationButton}
              type="button"
              className="btn btn-outline-primary"
              aria-expanded={isAddDestinationOpen}
              aria-controls="add-destination-panel"
              aria-disabled={addingDestination}
              onClick={() => {
                if (addingDestination) return;

                if (isAddDestinationOpen) {
                  closeAddDestination();
                } else {
                  setIsAddDestinationOpen(true);
                }
              }}
            >
              {isAddDestinationOpen
                ? "Hide Add Destination"
                : "Add Destination"}
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              aria-expanded={isFindIdeasOpen}
              aria-controls="find-ideas-panel"
              onClick={() => setIsFindIdeasOpen(open => !open)}
            >
              {isFindIdeasOpen ? "Hide ideas" : "Find ideas"}
            </button>
          </div>

          <div
            id="add-destination-panel"
            className="trip-add-destination-panel"
            aria-hidden={!isAddDestinationOpen}
          >
            <div className="overflow-hidden">
              <form
                onSubmit={handleAddDestination}
                className="border rounded-3 p-3 mt-3"
              >
                <h3 className="h6 mb-3">Add Destination</h3>

                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <label htmlFor="destination-name" className="form-label">
                      Destination Name
                    </label>

                    <input
                      id="destination-name"
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Phoenix or Grand Canyon"
                      value={destination.name}
                      onChange={handleDestinationChange}
                      maxLength={150}
                      required
                      disabled={!isAddDestinationOpen || isDestinationBusy}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="destination-type" className="form-label">
                      Destination Type
                    </label>

                    <select
                      id="destination-type"
                      name="type"
                      className="form-select"
                      value={destination.type}
                      onChange={handleDestinationChange}
                      disabled={!isAddDestinationOpen || isDestinationBusy}
                    >
                      {destinationTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="destination-city" className="form-label">
                      City (Optional)
                    </label>

                    <input
                      id="destination-city"
                      name="city"
                      type="text"
                      className="form-control"
                      value={destination.city}
                      onChange={handleDestinationChange}
                      maxLength={150}
                      disabled={!isAddDestinationOpen || isDestinationBusy}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="destination-state" className="form-label">
                      State / Region (Optional)
                    </label>

                    <input
                      id="destination-state"
                      name="state"
                      type="text"
                      className="form-control"
                      value={destination.state}
                      onChange={handleDestinationChange}
                      maxLength={150}
                      disabled={!isAddDestinationOpen || isDestinationBusy}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="destination-country" className="form-label">
                      Country (Optional)
                    </label>

                    <input
                      id="destination-country"
                      name="country"
                      type="text"
                      className="form-control"
                      value={destination.country}
                      onChange={handleDestinationChange}
                      maxLength={150}
                      disabled={!isAddDestinationOpen || isDestinationBusy}
                    />
                  </div>

                  {destination.type === "airport" && (
                    <div className="col-12 col-md-4">
                      <label
                        htmlFor="destination-airport-code"
                        className="form-label"
                      >
                        Airport Code (Optional)
                      </label>

                      <input
                        id="destination-airport-code"
                        name="airportCode"
                        type="text"
                        className="form-control"
                        placeholder="e.g. PHX"
                        value={destination.airportCode}
                        onChange={handleDestinationChange}
                        maxLength={3}
                        disabled={!isAddDestinationOpen || isDestinationBusy}
                      />
                    </div>
                  )}
                </div>

                {addDestinationError && (
                  <p className="text-danger mt-3 mb-0" role="alert">
                    {addDestinationError}
                  </p>
                )}

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isAddDestinationOpen || isDestinationBusy}
                  >
                    {addingDestination ? "Adding..." : "Add Destination"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeAddDestination}
                    disabled={!isAddDestinationOpen || addingDestination}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <section
            id="find-ideas-panel"
            className="border rounded p-3 mb-4"
            aria-labelledby="find-ideas-heading"
            hidden={!isFindIdeasOpen}
          >
            <h3 id="find-ideas-heading" className="h5">
              Ideas for San Diego
            </h3>
            {saveIdeaError && (
              <p className="text-danger mb-3" role="alert">
                {saveIdeaError}
              </p>
            )}

            <div
              className="d-flex flex-wrap gap-2 mb-3"
              role="group"
              aria-label="Filter ideas"
            >
              {["All", "Beaches", "Attractions"].map(category => {
                const isSelected = ideaCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-primary"}`}
                    aria-pressed={isSelected}
                    onClick={() => setIdeaCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="row g-3">
              {tripIdeaGroups
                .filter(
                  group =>
                    ideaCategory === "All" || group.category === ideaCategory,
                )
                .map(group => (
                  <div key={group.category} className="col-sm-6">
                    <h4 className="h6">{group.category}</h4>
                    <ul className="mb-0">
                      {group.ideas.map(idea => {
                        const isSaved = (trip.savedIdeas ?? []).includes(
                          idea.id,
                        );
                        const isSaving = savingIdeaId === idea.id;

                        return (
                          <li key={idea.id} className="mb-2">
                            {idea.name}{" "}
                            {isSaved ? (
                              <span
                                className="text-success ms-1"
                                role="img"
                                aria-label="Saved"
                              >
                                ✓
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={
                                  savingIdeaId !== null ||
                                  unsavingIdeaId !== null
                                }
                                onClick={() => handleSaveIdea(idea.id)}
                                aria-label={`Save ${idea.name}`}
                              >
                                {isSaving ? "Saving…" : "Save"}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
          </section>

          {savedIdeas.length > 0 && (
            <section
              className="border rounded p-3 mb-4"
              aria-labelledby="saved-ideas-heading"
            >
              <h3 id="saved-ideas-heading" className="h5">
                Saved ideas
              </h3>

              {moveIdeaError && (
                <p className="text-danger" role="alert">
                  {moveIdeaError}
                </p>
              )}

              <ul className="list-group list-group-flush">
                {savedIdeas.map(idea => (
                  <li key={idea.id} className="list-group-item px-0">
                    <div className="fw-semibold">{idea.name}</div>
                    <div className="small text-muted">{idea.category}</div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-2"
                      disabled={movingIdeaId !== null || savingIdeaId !== null}
                      onClick={() => handleMoveIdea(idea.id)}
                    >
                      {movingIdeaId === idea.id
                        ? "Moving…"
                        : "Move to itinerary"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm mt-2 ms-2"
                      disabled={
                        unsavingIdeaId !== null ||
                        movingIdeaId !== null ||
                        savingIdeaId !== null
                      }
                      onClick={() => handleUnsaveIdea(idea.id)}
                    >
                      {unsavingIdeaId === idea.id ? "Removing…" : "Unsave"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Destination errors */}
          {destinationError && (
            <p className="text-danger small" role="alert">
              {destinationError}
            </p>
          )}

          {editingStop && (
            <EditTripStop
              stop={editingStop}
              destinationTypes={destinationTypes}
              isBusy={isDestinationBusy}
              isSaving={savingStop}
              error={editStopError}
              onChange={handleEditStopChange}
              onSave={handleSaveStop}
              onCancel={handleCancelEditStop}
            />
          )}

          {photoStop && (
            <TripStopPhotos
              key={`${id}:${photoStop.id}`}
              tripId={id}
              stop={photoStop}
              onTripUpdated={setTrip}
              onClose={() => setPhotoStop(null)}
            />
          )}

          {/* Unified itinerary display */}
          {destinationCount === 0 ? (
            <p className="text-muted">
              No destinations added to this trip yet.
            </p>
          ) : (
            <ul className="list-group">
              <h4>Itinerary</h4>
              {itineraryStops.map((stop, index) => (
                <li key={stop.id} className="list-group-item trip-stop-row">
                  <div>
                    <div className="fw-semibold">📍 {stop.name}</div>

                    <div className="text-muted small">
                      {destinationTypes.find(type => type.value === stop.type)
                        ?.label || stop.type}

                      {[stop.city, stop.state, stop.country].filter(Boolean)
                        .length > 0 && (
                        <span>
                          {" · "}
                          {[stop.city, stop.state, stop.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}

                      {stop.airportCode && (
                        <span>
                          {" · "}
                          {stop.airportCode}
                        </span>
                      )}

                      {stop.isLegacy && (
                        <span>
                          {" · "}
                          Previously saved destination
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex flex-wrap align-items-center gap-2 trip-stop-row__actions"
                    onClick={() => setPhotoStop(stop)}
                    aria-label={`Media for ${stop.name}`}
                  >
                    Media (
                    {(stop.photos?.length ?? 0) + (stop.videos?.length ?? 0)})
                  </button>

                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    {!stop.isLegacy && (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleMoveStop(stop.id, -1)}
                          disabled={isDestinationBusy || index === 0}
                          aria-label={`Move ${stop.name} up`}
                          title="Move up"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleMoveStop(stop.id, 1)}
                          disabled={
                            isDestinationBusy || index === tripStops.length - 1
                          }
                          aria-label={`Move ${stop.name} down`}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    )}

                    <div className="d-flex gap-2 ms-auto">
                      {!stop.isLegacy && (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleStartEditStop(stop)}
                          disabled={isDestinationBusy || Boolean(editingStop)}
                          aria-label={`Edit ${stop.name}`}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          stop.isLegacy
                            ? handleRemoveLegacyDestination(stop.airportCode)
                            : handleRemoveStop(stop.id)
                        }
                        disabled={
                          isDestinationBusy || editingStop?.id === stop.id
                        }
                        aria-label={`Remove ${stop.name} from trip`}
                      >
                        {removingDestination ===
                        (stop.isLegacy ? stop.airportCode : stop.id)
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
