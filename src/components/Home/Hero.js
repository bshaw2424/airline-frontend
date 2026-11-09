import { Link } from "react-router-dom";
import HomeDescription from "./HomeDescription";

const Hero = () => {
  return (
    <section id="hero" className="home-hero">
      <div className="container">
        <div className="home-hero__layout">
          {/* Homepage heading and search */}
          <div className="home-hero__main">
            <HomeDescription />
          </div>

          {/* Homepage exploration cards */}
          <div className="home-hero__actions">
            {/* Explore Destinations */}
            <Link to="/destinations" className="home-hero__action-card">
              <div className="home-hero__action-content">
                <h3>Explore Destinations</h3>
                <p>Discover places to visit, cities, and airports.</p>
              </div>
            </Link>

            {/* Explore Airlines */}
            <Link to="/airlines" className="home-hero__action-card">
              <div className="home-hero__action-content">
                <h3>Explore Airlines</h3>
                <p>Discover where your favorite airlines fly.</p>
              </div>
            </Link>

            {/* Plan Your Trips */}
            <Link to="/my-trips" className="home-hero__action-card">
              <div className="home-hero__action-content">
                <h3>Plan Your Trips</h3>
                <p>Create and organize your personal travel itineraries.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
