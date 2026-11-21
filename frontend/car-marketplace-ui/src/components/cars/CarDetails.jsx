
import {
  formatPrice,
  getFuel,
  getTransmission,
  getBodyType,
} from "../../utils/carUtils";

function CarDetails({
  selectedCar,
  selectedImages,
  loading,
  closeCarDetails,
  activeImage,
  setActiveImage,
  setShowLightbox,
  previousImage,
  nextImage,
  toggleFavorite,
  isFavorite,
}) {
  return (
    <main className="car-detail-page">
      {!selectedCar ? (
        <div className="container detail-loading">
          {loading ? (
            <p>Elan yüklənir...</p>
          ) : (
            <>
              <p>Bu elan tapılmadı.</p>
              <button type="button" onClick={closeCarDetails}>
                Ana səhifəyə qayıt
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="container detail-container">
          <button
            type="button"
            className="back-button"
            onClick={closeCarDetails}
          >
            ← Bütün avtomobillər
          </button>

          {/* Avtomobil haqqında qısa məlumat sətri */}
          <div className="detail-quick-info">
            <span>{selectedCar.brand}</span>
            <span className="quick-info-divider">|</span>
            <span>{selectedCar.model}</span>
            <span className="quick-info-divider">|</span>
            <span>{selectedCar.year}</span>
            <span className="quick-info-divider">|</span>
            <span>{formatPrice(selectedCar.mileage)} km</span>
            <span className="quick-info-divider">|</span>
            <strong>{formatPrice(selectedCar.price)} AZN</strong>
          </div>

          <div className="detail-layout">
            <section className="detail-main-column">
              <div className="detail-gallery">
                {selectedImages.length > 0 ? (
                  <>
                    <div className="detail-main-image-wrap">
                      <img
                        className="detail-main-image"
                        src={
                          selectedImages[activeImage]?.imageUrl ||
                          selectedImages[0].imageUrl
                        }
                        alt={`${selectedCar.brand} ${selectedCar.model}`}
                        onClick={() => setShowLightbox(true)}
                      />

                      {selectedImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="gallery-arrow gallery-arrow-left"
                            onClick={previousImage}
                            aria-label="Əvvəlki şəkil"
                          >
                            ‹
                          </button>

                          <button
                            type="button"
                            className="gallery-arrow gallery-arrow-right"
                            onClick={nextImage}
                            aria-label="Növbəti şəkil"
                          >
                            ›
                          </button>
                        </>
                      )}

                      <span className="gallery-count">
                        {activeImage + 1} / {selectedImages.length}
                      </span>

                      {/* Avtomobil məlumatları və favorit düyməsi şəklin üzərində */}
                      <div className="detail-image-overlay">
                        <div className="detail-car-summary">
                          <span>{selectedCar.brand}</span>
                          <span className="summary-divider">|</span>
                          <span>{selectedCar.model}</span>
                          <span className="summary-divider">|</span>
                          <span>{selectedCar.year}</span>
                          <span className="summary-divider">|</span>
                          <span>{formatPrice(selectedCar.mileage)} km</span>
                          <span className="summary-divider">|</span>
                          <strong className="detail-overlay-price">
                            {formatPrice(selectedCar.price)} AZN
                          </strong>
                        </div>

                        <button
                          type="button"
                          className={`detail-favorite-button ${
                            isFavorite(selectedCar.id) ? "active" : ""
                          }`}
                          onClick={() => toggleFavorite(selectedCar.id)}
                          aria-label={
                            isFavorite(selectedCar.id)
                              ? "Favoritlərdən çıxar"
                              : "Favoritlərə əlavə et"
                          }
                        >
                          <span className="favorite-heart">
                            {isFavorite(selectedCar.id) ? "♥" : "♡"}
                          </span>

                          <span>
                            {isFavorite(selectedCar.id)
                              ? "Favoritlərdən çıxar"
                              : "Favoritlərə əlavə et"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="detail-thumbnails">
                      {selectedImages.map((image, index) => (
                        <button
                          type="button"
                          key={image.id || index}
                          className={activeImage === index ? "active" : ""}
                          onClick={() => setActiveImage(index)}
                        >
                          <img
                            src={image.imageUrl}
                            alt={`Avtomobil şəkli ${index + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-image detail-no-image">
                    Şəkil yoxdur
                  </div>
                )}
              </div>

              <div className="detail-description detail-panel">
                <p className="eyebrow">ELAN HAQQINDA</p>
                <h2>Avtomobil haqqında məlumat</h2>
                <p>
                  {selectedCar.description ||
                    "Əlavə məlumat qeyd edilməyib."}
                </p>
              </div>
            </section>

            <aside className="detail-sidebar">
              <div className="detail-specifications detail-panel">
                <p className="eyebrow">TEXNİKİ MƏLUMATLAR</p>
                <h2>Göstəricilər</h2>

                <div className="spec-row">
                  <span>Marka</span>
                  <strong>{selectedCar.brand}</strong>
                </div>

                <div className="spec-row">
                  <span>Model</span>
                  <strong>{selectedCar.model}</strong>
                </div>

                <div className="spec-row">
                  <span>Buraxılış ili</span>
                  <strong>{selectedCar.year}</strong>
                </div>

                <div className="spec-row">
                  <span>Ban növü</span>
                  <strong>{getBodyType(selectedCar.bodyType)}</strong>
                </div>

                <div className="spec-row">
                  <span>Yürüş</span>
                  <strong>{formatPrice(selectedCar.mileage)} km</strong>
                </div>
                <div className="spec-row">
                  <span>Ban növü</span>
                  <strong>{getBodyType(selectedCar.bodyType)}</strong>
                </div>

                <div className="spec-row">
                  <span>Mühərrikin həcmi</span>
                  <strong>
                    {selectedCar.engineVolume != null
                      ? `${selectedCar.engineVolume} L`
                      : "Məlum deyil"}
                  </strong>
                </div>

                <div className="spec-row">
                  <span>At gücü</span>
                  <strong>
                    {selectedCar.horsePower != null
                      ? `${selectedCar.horsePower} a.g.`
                      : "Məlum deyil"}
                  </strong>
                </div>

                <div className="spec-row">
                  <span>Yürüş</span>
                  <strong>{formatPrice(selectedCar.mileage)} km</strong>
                </div>

                <div className="spec-row">
                  <span>Yanacaq</span>
                  <strong>{getFuel(selectedCar.fuelType)}</strong>
                </div>

                <div className="spec-row">
                  <span>Sürətlər qutusu</span>
                  <strong>
                    {getTransmission(selectedCar.transmission)}
                  </strong>
                </div>

                <div className="spec-row">
                  <span>Rəng</span>
                  <strong>{selectedCar.color || "Məlum deyil"}</strong>
                </div>
              </div>

              <div className="seller-card">
                <p className="eyebrow">SATICI İLƏ ƏLAQƏ</p>
                <h2>{selectedCar.ownerName || "Satıcı"}</h2>

                <p className="seller-phone">
                  {selectedCar.contactPhone || "Telefon qeyd edilməyib"}
                </p>

                {selectedCar.contactPhone && (
                  <a
                    className="seller-call-button"
                    href={`tel:${selectedCar.contactPhone.replace(/[^\d+]/g, "")}`}
                  >
                    ☎ Satıcıya zəng et
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}

export default CarDetails;
