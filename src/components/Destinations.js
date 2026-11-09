import { useLoaderData } from "react-router-dom";
import api from "../api/axios";
import AirlineDestinationsPage from "./AirlineDestinationsPage";

function Destinations() {
  const airline = useLoaderData();

  return <AirlineDestinationsPage airline={airline} />;
}

const destinationsLoader = async ({ params }) => {
  const { slug } = params;

  const response = await api.get(`/api/airlines/${slug}/destinations`);

  return response.data;
};

export { Destinations as default, destinationsLoader };
