// Each entry describes a text input. The name matches a field on the stop
// and tells TripDetails which value to update when the user types.
const textFields = [
  { name: "name", label: "Name", maxLength: 150, required: true },
  { name: "city", label: "City", maxLength: 150 },
  { name: "state", label: "State / Region", maxLength: 150 },
  { name: "country", label: "Country", maxLength: 150 },
  { name: "airportCode", label: "Airport Code", maxLength: 3 },
];

// TripDetails holds the draft stop and sends the PATCH request.
// This component displays the draft and calls the supplied handlers.
export default function EditTripStop({
  stop,
  destinationTypes,
  isBusy,
  isSaving,
  error,
  onChange,
  onSave,
  onCancel,
}) {
  return (
    <form
      className="border rounded-3 p-3 mb-3"
      aria-labelledby="edit-trip-stop-heading"
      onSubmit={onSave}
    >
      <h3 id="edit-trip-stop-heading" className="h6 mb-3">
        Edit destination
      </h3>

      {/* Lock the form controls while the save request is in progress. */}
      <fieldset disabled={isSaving}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="edit-stop-type">
              Type
            </label>
            <select
              id="edit-stop-type"
              name="type"
              className="form-select"
              value={stop.type}
              onChange={onChange}
            >
              {/* Use the same destination types as the add-stop form. */}
              {destinationTypes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Read each input's current value from the draft stop. */}
          {textFields.map(({ name, label, maxLength, required }) => (
            <div key={name} className="col-md-6">
              <label className="form-label" htmlFor={`edit-stop-${name}`}>
                {label}
              </label>
              <input
                id={`edit-stop-${name}`}
                name={name}
                className="form-control"
                value={stop[name]}
                onChange={onChange}
                maxLength={maxLength}
                required={required}
              />
            </div>
          ))}

          <div className="col-12 d-flex gap-2">
            {/* Wait for any active itinerary operation before saving. */}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isBusy}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </fieldset>

      {/* Show the save error so the user can correct the draft and retry. */}
      {error && (
        <p className="text-danger mt-2 mb-0" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
