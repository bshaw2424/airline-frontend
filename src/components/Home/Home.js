import { useLoaderData, useNavigation } from "react-router-dom";
import api from "../../api/axios";

import FeaturedAirlines from "../FeaturedAirlines";
import AirlineFeatureDescription from "../AirlineFeatureDescription";
import Hero from "./Hero";
import Loader from "../Loader";

export default function Home() {
  const airlineNames = useLoaderData();
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  return (
    <main className="home-page">
      {isLoading ? (
        <Loader loading={isLoading} />
      ) : (
        <>
          {/* Hero and destination search */}
          <section className="home-page__hero">
            <Hero />
          </section>

          {/* Featured airlines */}
          <section className="home-page__airlines">
            <FeaturedAirlines airlineNames={airlineNames} />
          </section>

          {/* Feature highlights */}
          <section className="home-page__features">
            <AirlineFeatureDescription />
          </section>
        </>
      )}
    </main>
  );
}

export const destinationIndexLoader = async () => {
  try {
    const response = await api.get("/api/airlines/info");

    return response.data;
  } catch (error) {
    console.error("Unable to load airlines:", error);
    throw error;
  }
};
