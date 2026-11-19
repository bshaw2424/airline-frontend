const fs = require("node:fs");
const path = require("node:path");

const siteUrl = "https://flightinrange.com";
const buildDirectory = path.resolve(__dirname, "../build");
const template = fs.readFileSync(
  path.join(buildDirectory, "index.html"),
  "utf8",
);

const pages = [
  {
    route: "/",
    title: "FlightInRange | Discover Where Airlines Fly",
    description:
      "Explore airline destinations by airport, state, or country. Save places to Collections and build your itinerary in My Trips.",
  },
  {
    route: "/destinations",
    title: "Explore Airline Destinations | FlightInRange",
    description:
      "Search by airport, state, or country to see which airlines serve the destinations you want to visit.",
  },
  {
    route: "/airlines",
    title: "Explore Airlines and Where They Fly | FlightInRange",
    description:
      "Browse airlines and explore the domestic, international, and seasonal destinations they serve.",
  },
];

const airlines = [
  ["alaska-airlines", "Alaska Airlines"],
  ["allegiant-air", "Allegiant Air"],
  ["american-airlines", "American Airlines"],
  ["delta-airlines", "Delta Air Lines"],
  ["frontier-airlines", "Frontier Airlines"],
  ["hawaiian-airlines", "Hawaiian Airlines"],
  ["jetblue-airways", "JetBlue Airways"],
  ["southwest-airlines", "Southwest Airlines"],
  ["united-airlines", "United Airlines"],
];

for (const [slug, name] of airlines) {
  pages.push(
    {
      route: `/airlines/${slug}`,
      title: `${name} | FlightInRange`,
      description: `See where ${name} flies and browse its destinations by airport, state, or service type.`,
    },
    {
      route: `/airlines/${slug}/destinations`,
      title: `${name} Destinations | FlightInRange`,
      description: `Explore airports served by ${name} and filter destinations by state or by domestic and international service.`,
    },
  );
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setMeta(html, attribute, key, value) {
  const expression = new RegExp(
    `<meta\\b[^>]*\\b${attribute}=["']${key}["'][^>]*>`,
    "gi",
  );

  const tag = `<meta ${attribute}="${key}" content="${escapeAttribute(value)}">`;

  return html.replace(expression, "").replace("</head>", `${tag}</head>`);
}

for (const page of pages) {
  const url = `${siteUrl}${page.route}`;

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeAttribute(page.title)}</title>`,
  );

  html = setMeta(html, "name", "description", page.description);
  html = setMeta(html, "property", "og:title", page.title);
  html = setMeta(html, "property", "og:description", page.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", page.title);
  html = setMeta(html, "name", "twitter:description", page.description);

  // The template has no static canonical. Each generated page gets its own.
  html = html.replace(
    "</head>",
    `<link rel="canonical" href="${escapeAttribute(url)}"></head>`,
  );

  const destination =
    page.route === "/"
      ? path.join(buildDirectory, "index.html")
      : path.join(buildDirectory, page.route.slice(1), "index.html");

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
}

console.log(`Generated metadata for ${pages.length} public pages.`);
