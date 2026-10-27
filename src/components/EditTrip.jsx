import { useState } from "react";
import api from "../api/axios";

export default function EditTrip({ trip, onTripUpdated }) {
  const [formData, setFormData] = useState({
    name: trip.name || "",
    startDate: trip.startDate?.slice(0, 10) || "",
    endDate: trip.endDate?.slice(0, 10) || "",
    notes: trip.notes || "",
    coverImage: trip.coverImage || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
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
      const response = await api.put(`/api/trips/${trip._id}`, {
        name,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        notes: formData.notes.trim(),
        coverImage,
      });

      onTripUpdated?.(response.data.trip);
    } catch (error) {
      console.error("Unable to update trip:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update your trip. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="editTripName" className="form-label">
          Trip Name *
        </label>
        <input
          type="text"
          id="editTripName"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          required
          disabled={saving}
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label htmlFor="editStartDate" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            id="editStartDate"
            name="startDate"
            className="form-control"
            value={formData.startDate}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="editEndDate" className="form-label">
            End Date
          </label>
          <input
            type="date"
            id="editEndDate"
            name="endDate"
            className="form-control"
            min={formData.startDate || undefined}
            value={formData.endDate}
            onChange={handleChange}
            disabled={saving}
          />
        </div>
      </div>

      {/* Trip cover image */}
      <div className="mb-3">
        <label htmlFor="editTripCoverImage" className="form-label">
          Cover Image URL (Optional)
        </label>

        <input
          type="url"
          id="editTripCoverImage"
          name="coverImage"
          className="form-control"
          placeholder="https://example.com/travel-photo.jpg"
          value={formData.coverImage}
          onChange={handleChange}
          maxLength={2048}
          disabled={saving}
        />

        <div className="form-text">
          Enter a direct image URL. Leave blank to remove the cover image.
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

      <div className="mb-3">
        <label htmlFor="editTripNotes" className="form-label">
          Notes
        </label>
        <textarea
          id="editTripNotes"
          name="notes"
          className="form-control"
          rows={3}
          maxLength={1000}
          value={formData.notes}
          onChange={handleChange}
          disabled={saving}
        />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
}
