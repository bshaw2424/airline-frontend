import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function TripStopPhotos({
  tripId,
  stop,
  onClose,
  onTripUpdated,
}) {
  const dialogRef = useRef(null);
  // Gallery loading and request errors
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Upload status and gallery refresh trigger
  const [uploading, setUploading] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [photoListVersion, setPhotoListVersion] = useState(0);
  // Caption draft and save status
  const [editingMediaKey, setEditingMediaKey] = useState(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [savingCaption, setSavingCaption] = useState(false);
  const [captionError, setCaptionError] = useState("");
  // Photo deletion and error state
  const [deletingMediaKey, setDeletingMediaKey] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  // Videos and the active gallery filter
  const [videos, setVideos] = useState([]);
  const [mediaFilter, setMediaFilter] = useState("all");
  const [mediaSort, setMediaSort] = useState("oldest");

  // Track the open item and where to return in the gallery.
  const [activeMedia, setActiveMedia] = useState(null);
  const galleryScrollRef = useRef(0);
  const thumbnailButtonRef = useRef(null);
  const backButtonRef = useRef(null);

  // Open the native dialog and close it on unmount.
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();

    return () => dialog.close();
  }, []);

  // Fetch photos and videos when the stop changes or an upload succeeds.
  useEffect(() => {
    const controller = new AbortController();

    async function loadMedia() {
      setLoading(true);
      setError("");
      try {
        const stopUrl = `/api/trips/${tripId}/stops/${stop.id}`;
        const options = { signal: controller.signal };

        const [photoResponse, videoResponse] = await Promise.all([
          api.get(`${stopUrl}/photos`, options),
          api.get(`${stopUrl}/videos`, options),
        ]);

        if (!controller.signal.aborted) {
          setPhotos(photoResponse.data.photos);
          setVideos(videoResponse.data.videos);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error.response?.data?.message ||
              "Unable to load destination media.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadMedia();

    // Cancel both requests when the gallery closes or reloads.
    return () => controller.abort();
  }, [tripId, stop.id, photoListVersion]);

  // Move focus into the viewer and restore focus and scroll on return.
  useEffect(() => {
    if (activeMedia) {
      dialogRef.current.scrollTop = 0;
      backButtonRef.current?.focus();
    } else if (thumbnailButtonRef.current) {
      thumbnailButtonRef.current.focus({ preventScroll: true });
      dialogRef.current.scrollTop = galleryScrollRef.current;
      thumbnailButtonRef.current = null;
    }
  }, [activeMedia]);

  // Remember the selected tile before opening the full-size view.
  function openMedia(item, button) {
    galleryScrollRef.current = dialogRef.current.scrollTop;
    thumbnailButtonRef.current = button;
    setActiveMedia(item);
  }

  // Send each file to its own endpoint, then refresh the gallery and stop counts.
  async function handleMediaUpload(event, mediaType) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file || uploading || savingCaption || deletingMediaKey !== null)
      return;

    // Clear the picker so the same file can be selected again after an error.
    input.value = "";
    setUploadError("");

    const isVideo = mediaType === "video";
    const maxMiB = isVideo ? 25 : 5;

    if (file.size > maxMiB * 1024 * 1024) {
      setUploadError(`Choose a ${mediaType} that is ${maxMiB} MiB or smaller.`);
      return;
    }

    const formData = new FormData();
    formData.append(mediaType, file);

    setUploading(mediaType);

    try {
      const { data } = await api.post(
        `/api/trips/${tripId}/stops/${stop.id}/${isVideo ? "videos" : "photos"}`,
        formData,
      );

      setMediaSort("newest");
      setPhotoListVersion(version => version + 1);
      onTripUpdated?.(data.trip);
    } catch (error) {
      setUploadError(
        error.response?.data?.message || `Unable to upload the ${mediaType}.`,
      );
    } finally {
      setUploading(null);
    }
  }

  // Save the caption and update the matching thumbnail.
  async function handleSaveCaption(item) {
    if (savingCaption || uploading || loading) return;

    setSavingCaption(true);
    setCaptionError("");

    try {
      // Save the caption to the item's endpoint and update its gallery entry.
      const collection = item.type === "video" ? "videos" : "photos";
      const setItems = item.type === "video" ? setVideos : setPhotos;

      const { data } = await api.patch(
        `/api/trips/${tripId}/stops/${stop.id}/${collection}/${item._id}/caption`,
        { caption: captionDraft.trim() },
      );

      setItems(currentItems =>
        currentItems.map(current =>
          current._id === item._id
            ? { ...current, caption: data.caption }
            : current,
        ),
      );
      setEditingMediaKey(null);
    } catch (error) {
      setCaptionError(
        error.response?.data?.message || "Unable to save the caption.",
      );
    } finally {
      setSavingCaption(false);
    }
  }

  // Confirm deletion, then update the gallery and the trip's media count.
  async function handleDeleteMedia(item) {
    if (
      deletingMediaKey !== null ||
      editingMediaKey !== null ||
      savingCaption ||
      uploading ||
      loading
    ) {
      return;
    }

    if (!window.confirm(`Delete this ${item.type} and its caption?`)) return;

    const isVideo = item.type === "video";
    const collection = isVideo ? "videos" : "photos";
    const setItems = isVideo ? setVideos : setPhotos;

    setDeletingMediaKey(`${item.type}-${item._id}`);
    setDeleteError("");

    try {
      await api.delete(
        `/api/trips/${tripId}/stops/${stop.id}/${collection}/${item._id}`,
      );

      setItems(currentItems =>
        currentItems.filter(current => current._id !== item._id),
      );

      // TripDetails passes its state setter so the itinerary can update in place.
      onTripUpdated?.(currentTrip => {
        if (!currentTrip) return currentTrip;

        return {
          ...currentTrip,
          tripStops: currentTrip.tripStops.map(tripStop =>
            tripStop._id === stop.id
              ? {
                  ...tripStop,
                  [collection]: (tripStop[collection] ?? []).filter(
                    current => current._id !== item._id,
                  ),
                }
              : tripStop,
          ),
        };
      });
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || `Unable to delete the ${item.type}.`,
      );
    } finally {
      setDeletingMediaKey(null);
    }
  }

  // Merge both media types in upload order before applying the filter.
  const visibleMedia = [
    ...photos.map(photo => ({ ...photo, type: "photo" })),
    ...videos.map(video => ({ ...video, type: "video" })),
  ]
    .sort((first, second) => {
      const uploadOrder = (first.uploadedAt ?? "").localeCompare(
        second.uploadedAt ?? "",
      );

      return mediaSort === "newest" ? -uploadOrder : uploadOrder;
    })
    .filter(item => mediaFilter === "all" || item.type === mediaFilter);

  return (
    <dialog
      ref={dialogRef}
      className="trip-stop-photos border-0 shadow p-4"
      aria-labelledby="trip-stop-photos-title"
      onCancel={event => {
        event.preventDefault();
        // Escape returns to the gallery before closing the dialog.
        if (activeMedia) {
          setActiveMedia(null);
        } else {
          onClose();
        }
      }}
    >
      {/* Gallery styles and full-screen layout on phones */}
      <style>{`
        .trip-stop-photos {
          width: min(720px, calc(100% - 2rem));
          max-height: calc(100% - 2rem);
          border-radius: 1rem;
        }

        .trip-stop-photos::backdrop {
          background: rgba(0, 0, 0, 0.55);
        }

        /* Match the video tile to the photo thumbnail ratio. */
        .trip-stop-photos__video-tile {
          aspect-ratio: 4 / 3;
        }

        /* Fit the full media frame inside the viewer. */
        .trip-stop-photos__viewer-media {
          display: block;
          width: 100%;
          height: min(65vh, 640px);
          object-fit: contain;
        }

        @media (max-width: 575.98px) {
          .trip-stop-photos {
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
            margin: 0;
            border-radius: 0;
          }
        }
      `}</style>

      {/* Stack the title and navigation on phones and tablets. */}
      <header className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center gap-3 mb-3">
        <h2
          id="trip-stop-photos-title"
          className="h3 mb-0 text-center text-lg-start"
        >
          {stop.name}
        </h2>

        {activeMedia ? (
          <button
            ref={backButtonRef}
            type="button"
            className="btn btn-outline-secondary flex-shrink-0"
            onClick={() => setActiveMedia(null)}
          >
            Back to gallery
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary flex-shrink-0"
            onClick={onClose}
          >
            Close gallery
          </button>
        )}
      </header>

      {/* Show the full media frame and its saved caption. */}
      {activeMedia && (
        <section aria-label="Media viewer">
          {activeMedia.type === "video" ? (
            <video
              src={activeMedia.url}
              controls
              playsInline
              preload="metadata"
              className="trip-stop-photos__viewer-media bg-dark rounded"
              aria-label={`Video for ${stop.name}`}
            />
          ) : (
            <img
              src={activeMedia.url}
              alt={activeMedia.caption || stop.name}
              className="trip-stop-photos__viewer-media rounded"
              referrerPolicy="no-referrer"
            />
          )}

          {activeMedia.caption && (
            <p className="text-break mt-0 mb-0">{activeMedia.caption}</p>
          )}
        </section>
      )}

      {/* Keep the gallery mounted to preserve its filter and caption draft. */}
      <div hidden={activeMedia !== null}>
        {/* File picker and upload feedback */}
        {/* Upload controls and shared progress feedback. */}
        <div className="mb-3">
          <div className="row g-2">
            <div className="col-12">
              <label htmlFor="trip-stop-photo-upload" className="form-label">
                Upload photo
              </label>
              <input
                id="trip-stop-photo-upload"
                type="file"
                className="form-control"
                accept="image/*"
                disabled={
                  Boolean(uploading) ||
                  savingCaption ||
                  deletingMediaKey !== null
                }
                onChange={event => handleMediaUpload(event, "photo")}
              />
            </div>

            <div className="col-12 my-3">
              <label htmlFor="trip-stop-video-upload" className="form-label">
                Upload video
              </label>
              <input
                id="trip-stop-video-upload"
                type="file"
                className="form-control"
                accept=".mp4,.mov,video/mp4,video/quicktime"
                disabled={
                  Boolean(uploading) ||
                  savingCaption ||
                  deletingMediaKey !== null
                }
                onChange={event => handleMediaUpload(event, "video")}
              />
            </div>
          </div>

          {uploading && (
            <p role="status" className="mt-2 mb-0">
              {uploading === "video"
                ? "Uploading and processing video…"
                : "Uploading photo…"}
            </p>
          )}

          {uploadError && (
            <p role="alert" className="text-danger mt-2 mb-0">
              {uploadError}
            </p>
          )}
        </div>

        {/* Center the filter group on phones and tablets. */}
        <div
          className="d-flex justify-content-center justify-content-lg-start gap-2 mb-3"
          role="group"
          aria-label="Filter gallery"
        >
          {[
            { value: "all", label: "All" },
            { value: "photo", label: "Photos" },
            { value: "video", label: "Videos" },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mediaFilter === value}
              className={`btn btn-sm ${
                mediaFilter === value ? "btn-primary" : "btn-outline-primary"
              }`}
              disabled={editingMediaKey !== null}
              onClick={() => setMediaFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="d-flex justify-content-center justify-content-lg-start mb-3">
          <select
            aria-label="Sort by upload date"
            className="form-select  w-100"
            value={mediaSort}
            onChange={event => setMediaSort(event.target.value)}
            disabled={editingMediaKey !== null}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Gallery loading, error, and empty states */}
        {loading && <p role="status">Loading gallery…</p>}
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}

        {!loading && !error && visibleMedia.length === 0 && (
          <p className="text-muted mb-0">No items in this view yet.</p>
        )}

        {/* Report photo deletion errors once, above the grid. */}
        {deleteError && (
          <p role="alert" className="text-danger">
            {deleteError}
          </p>
        )}

        {/* Use one card and one caption editor for either media type. */}
        {visibleMedia.length > 0 && (
          <div className="row g-4">
            {visibleMedia.map((photo, index) => {
              const mediaKey = `${photo.type}-${photo._id}`;

              return (
                <div key={mediaKey} className="col-12 col-sm-6">
                  {/* Open the larger viewer from either tile type. */}
                  {photo.type === "video" ? (
                    <button
                      type="button"
                      className="trip-stop-photos__video-tile d-block w-100 rounded border-0 bg-dark text-white"
                      style={
                        photo.thumbnailUrl
                          ? {
                              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url("${photo.thumbnailUrl}")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }
                          : undefined
                      }
                      aria-label={`Open video ${index + 1} for ${stop.name}`}
                      onClick={event => openMedia(photo, event.currentTarget)}
                    >
                      {Number.isFinite(photo.durationSeconds) ? (
                        <span
                          aria-hidden="true"
                          className="badge bg-dark text-white"
                        >
                          {Math.floor(photo.durationSeconds / 60)}:
                          {String(
                            Math.floor(photo.durationSeconds % 60),
                          ).padStart(2, "0")}
                        </span>
                      ) : (
                        <span>View video</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="d-block w-100 p-0 border-0 bg-transparent rounded"
                      aria-label={`View photo ${index + 1} for ${stop.name}`}
                      onClick={event => openMedia(photo, event.currentTarget)}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="trip-stop-photos__image w-100 rounded"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  )}

                  {/* Show the caption editor for the selected item. */}
                  {editingMediaKey === mediaKey ? (
                    <div className="mt-2">
                      <label
                        htmlFor={`caption-${photo.type}-${photo._id}`}
                        className="form-label small mb-1"
                      >
                        Caption for {photo.type} {index + 1}
                      </label>
                      <textarea
                        id={`caption-${photo.type}-${photo._id}`}
                        className="form-control form-control-sm"
                        rows={2}
                        maxLength={200}
                        value={captionDraft}
                        disabled={savingCaption}
                        onChange={event => setCaptionDraft(event.target.value)}
                      />

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={savingCaption || uploading || loading}
                          onClick={() => handleSaveCaption(photo)}
                        >
                          {savingCaption ? "Saving…" : "Save caption"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={savingCaption}
                          onClick={() => setEditingMediaKey(null)}
                        >
                          Cancel
                        </button>
                      </div>

                      {captionError && (
                        <p role="alert" className="small text-danger mt-2 mb-0">
                          {captionError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      {photo.caption && (
                        <p className="small text-muted text-break mb-1">
                          {photo.caption}
                        </p>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0"
                          disabled={
                            editingMediaKey !== null ||
                            deletingMediaKey !== null
                          }
                          onClick={() => {
                            setCaptionDraft(photo.caption ?? "");
                            setCaptionError("");
                            setEditingMediaKey(mediaKey);
                          }}
                        >
                          {photo.caption ? "Edit caption" : "Add caption"}
                        </button>
                        {/* Delete the current photo or video from its gallery card. */}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm ms-2"
                          disabled={
                            deletingMediaKey !== null ||
                            editingMediaKey !== null ||
                            savingCaption ||
                            uploading ||
                            loading
                          }
                          onClick={() => handleDeleteMedia(photo)}
                        >
                          {deletingMediaKey === mediaKey
                            ? "Deleting…"
                            : `Delete ${photo.type}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </dialog>
  );
}
