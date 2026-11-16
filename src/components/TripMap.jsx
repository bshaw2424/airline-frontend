import { useEffect, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { axiosCallToLatitudeAndLongitudeCoordinates } from "./AirportAxiosQuery";

const mapContainerStyle = {
  width: "100%",
  height: "320px",
};

function getLookupKey(stop) {
  const airportCode = stop.airportCode?.trim().toUpperCase();

  if (stop.type === "airport" && airportCode) {
    return `airport:${airportCode}`;
  }

  // City stops can have a personal title, such as "beach".
  const place = stop.type === "city" ? stop.city || stop.name : stop.name;
  const address = [
    ...new Set(
      [place, stop.city, stop.state, stop.country]
        .map(value => value?.trim())
        .filter(Boolean),
    ),
  ].join(", ");

  return address ? `address:${address}` : null;
}

async function getPosition(key, geocoder) {
  if (key.startsWith("airport:")) {
    const airportCode = key.slice("airport:".length);
    const coordinates = await axiosCallToLatitudeAndLongitudeCoordinates(
      "iata",
      airportCode,
    );

    const { lat, lng } = coordinates ?? {};

    if (
      lat == null ||
      lng == null ||
      String(lat).trim() === "" ||
      String(lng).trim() === "" ||
      !(Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180)
    ) {
      return null;
    }

    return { lat: Number(lat), lng: Number(lng) };
  }

  const address = key.slice("address:".length);
  const { results } = await geocoder.geocode({ address });

  return results[0]?.geometry.location.toJSON() ?? null;
}

export default function TripMap({ stops }) {
  const [lookup, setLookup] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
  });

  // Location edits trigger new lookups. Reordering only changes pin labels.
  const lookupKey = JSON.stringify(
    [...new Set(stops.map(getLookupKey).filter(Boolean))].sort(),
  );

  useEffect(() => {
    if (!isLoaded || loadError) return;

    let active = true;

    async function loadPositions() {
      const keys = JSON.parse(lookupKey);
      const geocoder = new window.google.maps.Geocoder();

      const results = await Promise.allSettled(
        keys.map(key => getPosition(key, geocoder)),
      );

      if (!active) return;

      const positions = new Map();

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          positions.set(keys[index], result.value);
        }
      });

      setLookup({ key: lookupKey, positions });
    }

    loadPositions();

    return () => {
      active = false;
    };
  }, [isLoaded, loadError, lookupKey]);

  const positions = lookup?.key === lookupKey ? lookup.positions : null;

  useEffect(() => {
    if (!map || !positions?.size) return;

    const points = [...positions.values()];

    if (
      points.every(
        point => point.lat === points[0].lat && point.lng === points[0].lng,
      )
    ) {
      map.setCenter(points[0]);
      map.setZoom(10);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach(point => bounds.extend(point));
    map.fitBounds(bounds, 40);
  }, [map, positions]);

  const pins = [];
  const unavailableStops = [];

  stops.forEach((stop, index) => {
    const position = positions?.get(getLookupKey(stop));

    if (position) {
      pins.push({ stop, position, number: index + 1 });
    } else if (positions) {
      unavailableStops.push(stop.name);
    }
  });

  return (
    <section className="mb-4" aria-labelledby="trip-map-heading">
      {/* <h3 id="trip-map-heading" className="h5">
        Trip Map
      </h3> */}

      {loadError ? (
        <p className="text-muted mb-0" role="status">
          The trip map couldn’t load.
        </p>
      ) : !positions ? (
        <p className="text-muted mb-0" role="status">
          Loading trip map…
        </p>
      ) : pins.length > 0 ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          onLoad={setMap}
          onUnmount={() => setMap(null)}
        >
          {pins.map(({ stop, position, number }) => (
            <MarkerF
              key={`{stop.id}-${number}`}
              position={position}
              label={String(number)}
              title={`${number}. ${stop.name}`}
            />
          ))}
        </GoogleMap>
      ) : null}

      {unavailableStops.length > 0 && (
        <p className="text-muted mt-2 mb-0" role="status">
          Map location unavailable for {unavailableStops.join(", ")}.
        </p>
      )}
    </section>
  );
}
