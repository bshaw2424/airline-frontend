import { Link } from "react-router-dom";
import { MdOutlineErrorOutline } from "react-icons/md";

export default function NotFoundPage() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-page__content">
        <p className="not-found-page__code">404</p>

        <h1 id="not-found-title d-flex align-items-center justify-content-center">
          <span>
            <MdOutlineErrorOutline size={100} />
          </span>
          Page not found
        </h1>

        <p className="not-found-page__message">
          Looks like this link took a detour. Explore destinations to find your
          next stop.
        </p>

        <div className="d-grid d-sm-flex justify-content-sm-center gap-2">
          <Link to="/destinations" className="btn btn-primary">
            Explore Destinations
          </Link>

          <Link to="/" className="btn btn-outline-primary">
            Go to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
