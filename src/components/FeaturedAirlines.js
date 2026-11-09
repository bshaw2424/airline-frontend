import { Link } from "react-router-dom";

const FeaturedAirlines = ({ airlineNames }) => {
  return (
    <section className="mt-4 d-flex flex-column" id="featured">
      <div className="container pt-3 ">
        <h2 className="text-center mb-4">Featured Airlines</h2>

        <div className="row g-3">
          {airlineNames.map(airline => (
            <div className="col-12 col-sm-6 col-lg-3" key={airline.slug}>
              <Link
                to={`/airlines/${airline.slug}`}
                className="featured-airline-card d-flex align-items-center justify-content-center border rounded p-3 shadow-sm h-100"
              >
                <img
                  src={
                    airline.name === "Alaska Airlines"
                      ? "/alaska_thumbnail2.png"
                      : `/${airline.logo}.png`
                  }
                  alt={airline.name}
                  className="img-fluid"
                  style={{
                    width: "80%",
                    height: "100px",
                    objectFit: "contain",
                  }}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAirlines;
