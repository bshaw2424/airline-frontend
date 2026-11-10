import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function DeleteAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigation = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");

    const confirmed = window.confirm(
      "Permanently delete your FlightInRange account?\n\n" +
        "Your trips, collections, and saved favorites will also be deleted. " +
        "This cannot be undone.",
    );

    if (!confirmed) return;

    setError("");
    setShowPassword(false);
    setSubmitting(true);

    try {
      await api.delete("/api/auth/account", {
        data: { password },
      });

      window.location.replace("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete your account. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="mb-3">Delete your account</h1>

      <div className="alert alert-warning">
        Deleting your account permanently removes your trips, collections, and
        saved favorites. This cannot be undone.
      </div>

      <form className="col-md-6" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="delete-account-password" className="form-label">
            Current password
          </label>

          <div className="input-group">
            <input
              id="delete-account-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="form-control"
              disabled={submitting}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-controls="delete-account-password"
              disabled={submitting}
              onClick={() => setShowPassword(visible => !visible)}
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-danger" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-danger" type="submit" disabled={submitting}>
          {submitting ? "Deleting Account…" : "Delete Account"}
        </button>
        <Link
          onClick={navigation("/dashboard")}
          className="btn btn-outline-secondary ms-3"
        >
          Cancel
        </Link>
      </form>
    </main>
  );
}
