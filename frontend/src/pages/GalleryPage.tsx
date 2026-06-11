import { useEffect, useState } from "react";
import { fetchGallery, type GalleryItem } from "../services/api";
import "./GalleryPage.css";

function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the gallery once when this page first renders
  useEffect(() => {
    fetchGallery()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="gallery-page">
      <header className="gallery-page__header">
        <h1>Gallery</h1>
        <p className="gallery-page__subtitle">Images you've generated so far.</p>
      </header>

      {isLoading && <p className="gallery-page__message">Loading...</p>}
      {error && <p className="gallery-page__message gallery-page__message--error">{error}</p>}
      {!isLoading && !error && items.length === 0 && (
        <p className="gallery-page__message">
          No images yet - generate one on the Home page!
        </p>
      )}

      <div className="gallery-page__grid">
        {items.map((item) => (
          <figure key={item.id} className="gallery-page__item">
            <img
              className="gallery-page__image"
              src={item.imageUrl}
              alt={item.prompt}
            />
            <figcaption className="gallery-page__caption">{item.prompt}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default GalleryPage;
