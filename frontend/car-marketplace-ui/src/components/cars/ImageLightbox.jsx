
import { formatPrice } from "../../utils/carUtils";

function ImageLightbox({
  selectedImages,
  activeImage,
  selectedCar,
  setShowLightbox,
  previousImage,
  nextImage,
}) {
  if (!selectedImages || selectedImages.length === 0) {
    return null;
  }

  return (
    <div
      className="image-lightbox"
      onClick={() => setShowLightbox(false)}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={() => setShowLightbox(false)}
        aria-label="Bağla"
      >
        ×
      </button>

      {selectedImages.length > 1 && (
        <button
          type="button"
          className="lightbox-arrow lightbox-arrow-left"
          onClick={(event) => {
            event.stopPropagation();
            previousImage();
          }}
          aria-label="Əvvəlki şəkil"
        >
          ‹
        </button>
      )}

      <div
        className="lightbox-content"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className="lightbox-image"
          src={selectedImages[activeImage]?.imageUrl}
          alt={`${selectedCar?.brand || ""} ${selectedCar?.model || ""}`}
        />

        {/* Avtomobil məlumatları bütün şəkillərdə görünür */}
        {selectedCar && (
          <div className="lightbox-car-info">
            <div className="lightbox-car-title">
              {selectedCar.brand} {selectedCar.model}
            </div>

            <div className="lightbox-car-details">
              <span>{selectedCar.year}</span>
              <span className="lightbox-divider">|</span>
              <span>{formatPrice(selectedCar.mileage)} km</span>
              <span className="lightbox-divider">|</span>
              <strong>{formatPrice(selectedCar.price)} AZN</strong>
            </div>
          </div>
        )}
      </div>

      {selectedImages.length > 1 && (
        <button
          type="button"
          className="lightbox-arrow lightbox-arrow-right"
          onClick={(event) => {
            event.stopPropagation();
            nextImage();
          }}
          aria-label="Növbəti şəkil"
        >
          ›
        </button>
      )}

      <span className="lightbox-counter">
        {activeImage + 1} / {selectedImages.length}
      </span>
    </div>
  );
}

export default ImageLightbox;
