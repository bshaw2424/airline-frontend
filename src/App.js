import "./App.css";

import NavRoot from "./components/NavRoot";
import Home, {
  destinationIndexLoader as homeLoader,
} from "./components/Home/Home";
import About from "./components/Static/About";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import SavedDestinations from "./components/SavedDestinations";
import SavedAirlines from "./components/SavedAirlines";
import Dashboard from "./components/Dashboard";
import Collections from "./components/Collections";
import CollectionDetails from "./components/CollectionDetails";
import MyTrips from "./components/MyTrips";
import TripDetails from "./components/TripDetails";
import ExploreDestinations from "./components/ExploreDestinations";
import DeleteAccount from "./components/Auth/DeleteAccount";

import { airlinesLoader } from "./loaders/airlinesLoader";
import Destinations, { destinationsLoader } from "./components/Destinations";
import ResetPassword from "./components/Auth/ResetPassword";
import ForgotPassword from "./components/Auth/ForgotPassword";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import ExploreAirlines from "./components/ExploreAirlines";
import AirlineSearch from "./components/AirlineSearch";
import NotFoundPage from "./components/Error/NotFoundPage";
import AirlinePage from "./components/Airline/AirlinePage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<NavRoot />}>
      {/* Public pages */}
      <Route index element={<Home />} loader={homeLoader} />

      <Route path="about" element={<About />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/delete-account" element={<DeleteAccount />} />

      {/* Airline pages */}
      <Route
        path="airlines"
        element={<ExploreAirlines />}
        loader={airlinesLoader}
      />

      <Route
        path="airlines/search"
        element={<AirlineSearch />}
        loader={airlinesLoader}
      />

      <Route
        path="airlines/:slug"
        element={<AirlinePage />}
        loader={airlinesLoader}
      />

      <Route
        path="airlines/:slug/destinations"
        element={<Destinations />}
        loader={destinationsLoader}
      />

      {/* Saved items */}
      <Route
        path="saved-destinations"
        element={<SavedDestinations />}
        loader={airlinesLoader}
      />

      <Route
        path="saved-airlines"
        element={<SavedAirlines />}
        loader={airlinesLoader}
      />

      {/* Collections */}
      <Route
        path="collections"
        element={<Collections />}
        loader={airlinesLoader}
      />

      {/* Trips  */}
      <Route path="my-trips" element={<MyTrips />} />

      <Route
        path="collections/:id"
        element={<CollectionDetails />}
        loader={airlinesLoader}
      />

      <Route path="destinations" element={<ExploreDestinations />} />

      {/* Dashboard */}
      <Route path="dashboard" element={<Dashboard />} />

      {/* Trips */}
      <Route path="my-trips" element={<MyTrips />} />
      <Route path="my-trips/:id" element={<TripDetails />} />

      {/* Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
