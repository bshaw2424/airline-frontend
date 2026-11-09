import HomeSearch from "./Search/HomeSearch";

export default function ExploreDestinations() {
  return (
    <main className="explore-destinations py-4">
      <div>
        <header className="text-center mb-4">
          <h1 className="fw-bold">Explore Destinations</h1>

          <p className="lead text-muted">
            Discover new places and see which airlines can take you there.
          </p>
        </header>

        {/* Destination Search */}
        <HomeSearch showPopularDestinations={true} />
      </div>
    </main>
  );
}
