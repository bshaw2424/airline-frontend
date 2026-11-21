import { Link } from "react-router-dom";

const steps = [
  {
    title: "Explore destinations and airlines",
    description:
      "Thinking about San Diego? Search for San Diego or SAN in Explore Destinations to see which airlines fly there. If you already have an airline in mind, browse its destinations in Explore Airlines.",
    links: [
      { to: "/destinations", label: "Explore destinations" },
      { to: "/airlines", label: "Explore airlines" },
    ],
  },
  {
    title: "Save places in Collections",
    description:
      "Create a San Diego collection and save places you’re considering, like Balboa Park and La Jolla Shores. Sign in to save places and come back to them later.",
    links: [{ to: "/collections", label: "Open Collections" }],
  },
  {
    title: "Build an itinerary in My Trips",
    description:
      "Create a San Diego trip and add the places you’ve decided to visit. Put Balboa Park first and La Jolla Shores second, then reorder the stops if your plans change.",
    links: [{ to: "/my-trips", label: "Open My Trips" }],
  },
];

export default function GettingStarted() {
  return (
    <main className="container py-4 py-md-5">
      <h1 className="mb-4">Getting Started</h1>

      <ol className="ps-4">
        {steps.map(step => (
          <li key={step.title} className="mb-4">
            <h2 className="h4">{step.title}</h2>
            <p>{step.description}</p>

            <div className="d-grid d-sm-flex flex-wrap gap-2">
              {step.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="btn btn-outline-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
