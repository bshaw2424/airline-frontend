

import { useState } from "react";
import api from "../api/axios";

export default function CreateTrip({ onTripCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    notes: "",
    coverImage: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (saving) return;

    const name = formData.name.trim();
    const coverImage = formData.coverImage.trim();

    if (!name) {
      setError("Please enter a trip name.");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      setError("End date cannot be before start date.");
      return;
    }

    if (coverImage) {
      try {
        const imageUrl = new URL(coverImage);

        if (!["https:", "http:"].includes(imageUrl.protocol)) {
          setError("Cover image must use HTTP or HTTPS.");
          return;
        }
      } catch {
        setError("Please enter a valid cover image URL.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post("/api/trips", {
        name,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        notes: formData.notes.trim(),
        coverImage,
      });

      onTripCreated?.(response.data.trip);
    } catch (error) {
      console.error("Unable to create trip:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to create your trip. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Trip Name */}
      <div className="mb-3">
        <label htmlFor="tripName" className="form-label">
          Trip Name *
        </label>

        <input
          type="text"
          id="tripName"
          name="name"
          className="form-control"
          placeholder="e.g. Arizona Adventure"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          required
          disabled={saving}
        />
      </div>

      {/* Trip Dates */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label htmlFor="startDate" className="form-label">
            Start Date
          </label>

          <input
            type="date"
            id="startDate"
            name="startDate"
            className="form-control"
            value={formData.startDate}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="endDate" className="form-label">
            End Date
          </label>

          <input
            type="date"
            id="endDate"
            name="endDate"
            className="form-control"
            min={formData.startDate || undefined}
            value={formData.endDate}
            onChange={handleChange}
            disabled={saving}
          />
        </div>
      </div>

      {/* Trip Cover Image */}
      <div className="mb-3">
        <label htmlFor="tripCoverImage" className="form-label">
          Cover Image URL (Optional)
        </label>

        <input
          type="url"
          id="tripCoverImage"
          name="coverImage"
          className="form-control"
          placeholder="https://example.com/travel-photo.jpg"
          value={formData.coverImage}
          onChange={handleChange}
          maxLength={2048}
          disabled={saving}
        />

        <div className="form-text">
          Enter a direct image URL. You can also add or change the image later
          when editing your trip.
        </div>

        {formData.coverImage.trim() && (
          <div className="mt-3">
            <img
              src={formData.coverImage.trim()}
              alt="Trip cover preview"
              className="img-fluid rounded-3"
              style={{
                width: "100%",
                maxHeight: "220px",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>

      {/* Trip Notes */}
      <div className="mb-3">
        <label htmlFor="tripNotes" className="form-label">
          Notes
        </label>

        <textarea
          id="tripNotes"
          name="notes"
          className="form-control"
          rows={3}
          maxLength={1000}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Anything you'd like to remember about this trip..."
          disabled={saving}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Submit */}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Creating Trip..." : "Create Trip"}
      </button>
    </form>
  );
}
