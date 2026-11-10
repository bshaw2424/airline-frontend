import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function ResetPassword() {
  const { hash } = useLocation();
  const token = new URLSearchParams(hash.slice(1)).get("token");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");

    if (password !== formData.get("confirmPassword")) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/auth/reset-password", { token, password });
      setUpdated(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not reset your password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="mb-3">Reset your password</h1>

      {updated ? (
        <>
          <p role="status">Your password has been updated.</p>
          <Link to="/login">Sign in with your new password</Link>
        </>
      ) : !token ? (
        <p role="alert">
          This page needs a reset link. Open the link from your recovery email.
        </p>
      ) : (
        <form className="col-md-6" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="new-password" className="form-label">
              New password
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirm-password" className="form-label">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="form-control"
              required
            />
          </div>

          {error && (
            <p className="text-danger" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Updating password…" : "Update password"}
          </button>
        </form>
      )}
    </main>
  );
}
