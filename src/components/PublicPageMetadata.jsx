import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://flightinrange.com";

const publicPages = {
  "/": {
    title: "FlightInRange | Discover Where Airlines Fly",
    description:
      "Explore airline destinations by airport, state, or country. Save places to Collections and build your itinerary in My Trips.",
  },
  "/destinations": {
    title: "Explore Airline Destinations | FlightInRange",
    description:
      "Search by airport, state, or country to see which airlines serve the destinations you want to visit.",
  },
  "/airlines": {
    title: "Explore Airlines and Where They Fly | FlightInRange",
    description:
      "Browse airlines and explore the domestic, international, and seasonal destinations they serve.",
  },
};

export function usePageMetadata({ title, description, path }) {
  useEffect(() => {
    if (!title || !description || !path) return;

    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.content;

    document.title = title;
    if (descriptionTag) descriptionTag.content = description;

    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = new URL(path, SITE_URL).href;
    document.head.appendChild(canonical);

    return () => {
      document.title = previousTitle;
      if (descriptionTag) descriptionTag.content = previousDescription;
      canonical.remove();
    };
  }, [title, description, path]);
}

export default function PublicPageMetadata() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = publicPages[path];

  usePageMetadata({
    title: page?.title,
    description: page?.description,
    path,
  });

  return null;
}
