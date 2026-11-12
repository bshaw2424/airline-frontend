import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function useDestinationFavorites() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [savedDestinations, setSavedDestinations] = useState(null);
  const [savingDestination, setSavingDestination] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    setSavedDestinations(null);
    setFavoritesError("");

    if (!isLoggedIn) return;

    let active = true;

    async function loadSavedDestinations() {
      try {
        const response = await api.get("/api/favorites/destinations");

        if (active) {
          setSavedDestinations(response.data.savedDestinations ?? []);
        }
      } catch {
        if (active) {
          setFavoritesError(
            "Unable to load saved destinations. Refresh to retry.",
          );
        }
      }
    }

    loadSavedDestinations();

    return () => {
      active = false;
    };
  }, [authLoading, isLoggedIn]);

  const saveDisabled =
    authLoading ||
    savingDestination ||
    (isLoggedIn && savedDestinations === null);

  async function handleToggleSave(airportCode) {
    if (saveDisabled) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setSavingDestination(true);
    setFavoritesError("");

    try {
      const response = savedDestinations.includes(airportCode)
        ? await api.delete(`/api/favorites/destinations/${airportCode}`)
        : await api.post("/api/favorites/destinations", { airportCode });

      setSavedDestinations(response.data.savedDestinations ?? []);
    } catch {
      setFavoritesError(
        "Unable to update saved destinations. Please try again.",
      );
    } finally {
      setSavingDestination(false);
    }
  }

  function renderSaveButton(destination, tabIndex) {
    const airportCode = destination.airport_code?.trim().toUpperCase();

    if (!airportCode) return null;

    const isSaved =
      isLoggedIn && (savedDestinations?.includes(airportCode) ?? false);

    return (
      <button
        type="button"
        tabIndex={tabIndex}
        className="btn btn-link p-2 border-0"
        aria-label={`Save ${destination.name || airportCode}`}
        aria-pressed={isSaved}
        title={isSaved ? "Remove from saved destinations" : "Save destination"}
        disabled={saveDisabled}
        onClick={() => handleToggleSave(airportCode)}
      >
        {isSaved ? (
          <FaHeart className="text-danger" size={19} aria-hidden="true" />
        ) : (
          <FaRegHeart className="text-secondary" size={19} aria-hidden="true" />
        )}
      </button>
    );
  }

  return { favoritesError, renderSaveButton };
}
