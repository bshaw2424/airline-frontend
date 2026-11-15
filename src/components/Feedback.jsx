import api from "../api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Feedback() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Show the confirmation briefly before returning home.
  useEffect(() => {
    if (!success) return;

    const redirectTimer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2500);

    return () => clearTimeout(redirectTimer);
  }, [success, navigate]);

  // Submit feedback and keep the draft if the request fails.
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setSuccess("");
    setError("");

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Enter a message before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/api/feedback", {
        category,
        message: trimmedMessage,
      });

      setCategory("");
      setMessage("");
      setSuccess(data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to send your feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="mb-3">Feedback</h1>

          <form onSubmit={handleSubmit}>
            {/* Collect the feedback category and message. */}
            <fieldset disabled={submitting}>
              <div className="mb-3">
                <label htmlFor="feedback-category" className="form-label">
                  Category
                </label>
                <select
                  id="feedback-category"
                  className="form-select"
                  value={category}
                  onChange={event => setCategory(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  <option value="bug">Bug report</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="general">General feedback</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="feedback-message" className="form-label">
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  className="form-control"
                  rows={5}
                  maxLength={2000}
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {submitting ? "Sending…" : "Send feedback"}
              </button>
            </fieldset>

            {/* Announce the submission result. */}
            {success && (
              <p className="alert alert-success mt-3" role="status">
                {success}
              </p>
            )}
            {error && (
              <p className="alert alert-danger mt-3" role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
