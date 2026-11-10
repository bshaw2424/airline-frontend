import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email").trim();

    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (error) {
      setError(
        error.response?.status === 429
          ? "Too many requests. Please wait before trying again."
          : "We couldn't submit your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-5">
      <h1 className="mb-3">Forgot your password?</h1>

      {submitted ? (
        <p role="status">
          If an account exists for that email, we'll send a password reset link.
          Check your inbox and spam folder.
        </p>
      ) : (
        <form className="col-md-6 mb-3" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="recovery-email" className="form-label">
              Account email
            </label>
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
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
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <Link className="btn btn-link" to="/login">
        Back to sign in
      </Link>
    </main>
  );
}
