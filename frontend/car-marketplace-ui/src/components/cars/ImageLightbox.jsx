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

      <img
        className="lightbox-image"
        src={selectedImages[activeImage]?.imageUrl}
        alt={`${selectedCar?.brand || ""} ${selectedCar?.model || ""}`}
        onClick={(event) => event.stopPropagation()}
      />

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