import { useLoaderData } from "react-router-dom";
import api from "../api/axios";

export async function sharedItineraryLoader({ params, request }) {
  try {
    const { data } = await api.get(
      `/api/trips/shared/${encodeURIComponent(params.token)}`,
      { signal: request.signal, withCredentials: false },
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export default function SharedItinerary() {
  const itinerary = useLoaderData();

  if (!itinerary) {
    return (
      <main className="container py-4">
        <h1 className="h3">Shared itinerary not found</h1>
        <p>This link may have been revoked.</p>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <h1 className="h3">{itinerary.name}</h1>

      {itinerary.stops.length === 0 ? (
        <p>No stops have been added yet.</p>
      ) : (
        <ol className="list-group list-group-numbered">
          {itinerary.stops.map((stop, index) => {
            const location = [stop.city, stop.state, stop.country]
              .filter(Boolean)
              .join(", ");

            return (
              <li key={index} className="list-group-item">
                <strong>{stop.name}</strong>
                {stop.airportCode && <span> ({stop.airportCode})</span>}
                {location && <div className="text-muted">{location}</div>}
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
