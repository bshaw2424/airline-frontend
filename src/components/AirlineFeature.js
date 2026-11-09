import { Link } from "react-router-dom";
const AirlineFeature = ({ link }) => {
  // const marginClass = isLast ? "me-0" : "me-5";
  return (
    <div
      className={`flex-column airline-feature`}
      style={{
        fontSize: "1.2em",
      }}
    >
<h2 className="airline-feature__title">
  Airport Security Tips
</h2>
<p className="airline-feature__description">
  Discover what items are <span className="text-danger">Prohibited</span>{" "}
  and what items are <span className="text-success">Acceptable</span> for
  carry-on and checked luggage before arriving at the airport.
</p>
      <span>
<Link
  to={link}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="What Can I Bring? Visit the TSA website"
  className="btn airline-feature__button"
>
  What Can I Bring?
</Link>
      </span>
    </div>
  );
};

export default AirlineFeature;
