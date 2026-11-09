import api from "../api/axios";

// Load airline data for routes that display airlines and destinations.
export async function airlinesLoader() {
  const response = await api.get("/api/airlines/info");
  return response.data;
}
