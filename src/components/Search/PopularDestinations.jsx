const popularDestinations = [
  {
    id: 1,
    name: "Sedona",
    state: "Arizona",
    searchTerm: "Sedona",
    image: "/sedona.jpg",
  },
  {
    id: 2,
    name: "Las Vegas",
    state: "Nevada",
    searchTerm: "Las Vegas",
    image: "/las-vegas.jpg",
  },
  {
    id: 3,
    name: "New York",
    state: "New York",
    searchTerm: "New York",
    image: "/new-york.jpg",
  },
];

export default function PopularDestinations({ onSelectDestination }) {
  return (
    <section className="popular-destinations container my-5">
      <header className="text-center mb-4">
        <h2 className="fw-bold">Where will you go next?</h2>

        <p className="text-muted">
          Need some inspiration? Explore popular destinations and discover which
          airlines can take you there.
        </p>
      </header>

      <div className="row g-4">
        {popularDestinations.map(destination => (
          <div
            key={destination.id}
            className={`col-12 ${
              destination.id === 3 ? "col-md-12" : "col-md-6"
            } col-lg-4`}
          >
            <button
              type="button"
              className="popular-destinations__card border rounded-3 shadow-sm bg-white h-100 overflow-hidden w-100 p-0 text-start"
              onClick={() => onSelectDestination?.(destination.searchTerm)}
              aria-label={`Search destinations in ${destination.name}, ${destination.state}`}
            >
              <div className="popular-destinations__image-wrapper">
                <img
                  src={destination.image}
                  alt={`Scenic view of ${destination.name}, ${destination.state}`}
                  className="popular-destinations__image"
                  loading="lazy"
                />
              </div>

              <div className="p-3">
                <h3 className="fs-5 fw-semibold mb-1">{destination.name}</h3>

                <p className="text-muted mb-0">{destination.state}</p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
