
import {
  formatPrice,
  getFuel,
  getTransmission,
  getPrimaryImage,
} from "../../utils/carUtils";

function formatListingDate(value) {
  if (!value) return "Tarix göstərilməyib";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarix göstərilməyib";
  }

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CarList({
  search,
  setSearch,
  category,
  setCategory,
  loading,
  error,
  loadCars,
  filteredCars,
  carImages,
  openCarDetails,
  favoriteIds,
  toggleFavorite,
  isFavorite,
}) {
  return (
    <section className="cars-section" id="cars">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">AVTOMOBİL KATALOQU</p>
          <h2>
            Öz avtomobilini <span>tap</span>
          </h2>
          <p>Seç, müqayisə et və sənə uyğun avtomobili tap.</p>
        </div>

        <div className="filter-area">
          <input
            className="search-input"
            type="text"
            placeholder="Marka, model və ya il axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="category-buttons">
            <button
              className={category === "all" ? "active" : ""}
              onClick={() => setCategory("all")}
            >
              Hamısı
            </button>

            <button
              className={category === "sedan" ? "active" : ""}
              onClick={() => setCategory("sedan")}
            >
              Sedan
            </button>

            <button
              className={category === "suv" ? "active" : ""}
              onClick={() => setCategory("suv")}
            >
              SUV
            </button>
          </div>
        </div>

        {loading && (
          <p className="status-message">
            Avtomobillər yüklənir...
          </p>
        )}

        {error && (
          <div className="status-message error">
            {error}
            <button onClick={loadCars}>Yenidən yoxla</button>
          </div>
        )}

        {!loading && !error && filteredCars.length === 0 && (
          <p className="status-message">
            Avtomobil tapılmadı.
          </p>
        )}

        <div className="cars-grid">
          {filteredCars.map((car) => (
            <article
              className="car-card"
              key={car.id}
              onClick={() => openCarDetails(car)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openCarDetails(car);
                }
              }}
            >
              <button
                type="button"
                className={`favorite-button ${
                  isFavorite(car.id) ? "active" : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFavorite(car.id);
                }}
                aria-label={
                  isFavorite(car.id)
                    ? "Favoritlərdən çıxar"
                    : "Favoritlərə əlavə et"
                }
              >
                {isFavorite(car.id) ? "♥" : "♡"}
              </button>

              <div className="car-image">
                {getPrimaryImage(car, carImages) ? (
                  <img
                    src={getPrimaryImage(car, carImages)}
                    alt={`${car.brand} ${car.model}`}
                  />
                ) : (
                  <div className="no-image">Şəkil yoxdur</div>
                )}

                <span className="car-image-label">
                  CAR MARKET
                </span>
              </div>

              <div className="car-info">
                <h3>
                  {car.brand} {car.model}
                </h3>

                <p className="car-year">
                  {car.year}
                  {" · "}
                  {car.engineVolume != null
                    ? `${Number(car.engineVolume).toFixed(1)} L`
                    : "Həcm göstərilməyib"}
                  {" · "}
                  {car.horsePower
                    ? `${car.horsePower} a.g.`
                    : "Güc göstərilməyib"}
                  {" · "}
                  {getFuel(car.fuelType)}
                </p>

                <div className="car-details">
                  <span>
                    ◷ {formatPrice(car.mileage)} km
                  </span>
                  <span>
                    {getTransmission(car.transmission)}
                  </span>
                </div>

                <div className="car-location">
                  <span>⌖</span>
                  <span>
                    {car.location || "Yerləşmə göstərilməyib"}
                  </span>
                </div>

                <div className="car-listing-date">
                  Elan tarixi: {formatListingDate(car.createdAt)}
                </div>

                <div className="car-card-bottom">
                  <h4>
                    {formatPrice(car.price)} <small>AZN</small>
                  </h4>

                  <button
                    type="button"
                    className="details-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openCarDetails(car);
                    }}
                  >
                    Ətraflı <span>→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CarList;
