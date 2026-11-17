import { useLoaderData, useParams } from "react-router-dom";
import api from "../api/axios";
import AirlineDestinationsPage from "./AirlineDestinationsPage";
import { usePageMetadata } from "./PublicPageMetadata";

function Destinations() {
  const airline = useLoaderData();
  const { slug } = useParams();
  const airlineName = airline?.name;

  usePageMetadata({
    title: airlineName
      ? `${airlineName} Destinations | FlightInRange`
      : undefined,
    description: airlineName
      ? `Explore airports served by ${airlineName} and filter destinations by state or by domestic and international service.`
      : undefined,
    path: slug
      ? `/airlines/${encodeURIComponent(slug)}/destinations`
      : undefined,
  });

  return <AirlineDestinationsPage airline={airline} />;
}

const destinationsLoader = async ({ params }) => {
  const { slug } = params;

  const response = await api.get(`/api/airlines/${slug}/destinations`);

  return response.data;
};

export { Destinations as default, destinationsLoader };
