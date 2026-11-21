
import { useEffect, useState } from "react";
import { fetchCarById } from "../../services/carService";
import {
  formatPrice,
  getFuel,
  getTransmission,
} from "../../utils/carUtils";

function Favorites({
  favoriteIds,
  toggleFavorite,
  openCarDetails,
}) {
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      if (!favoriteIds.length) {
        setFavoriteCars([]);
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all(
          favoriteIds.map(async (id) => {
            try {
              return await fetchCarById(id);
            } catch (error) {
              console.error(`Avtomobil ${id} yüklənmədi:`, error);
              return null;
            }
          })
        );

        if (!cancelled) {
          setFavoriteCars(results.filter(Boolean));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  if (loading) {
    return (
      <section className="favorites-section">
        <div className="container">
          <p className="status-message">Favoritlər yüklənir...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="favorites-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">SEÇDİKLƏRİN</p>
          <h2>Favoritlərim</h2>
          <p>Saxladığın avtomobillər burada görünür.</p>
        </div>

        {favoriteCars.length === 0 ? (
          <p className="status-message">
            Hələ favorit avtomobil yoxdur.
          </p>
        ) : (
          <div className="cars-grid">
            {favoriteCars.map((car) => {
              const imageUrl =
                car.imageUrls?.[0] ||
                car.images?.[0]?.imageUrl;

              const isDeleted = car.status === "DELETED";

              return (
                <article
                  className="car-card favorite-car-card"
                  key={car.id}
                >
                  <div
                    className="car-image"
                    onClick={() => openCarDetails(car)}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${car.brand} ${car.model}`}
                      />
                    ) : (
                      <div className="no-image">Şəkil yoxdur</div>
                    )}

                    {isDeleted && (
                      <span className="favorite-unavailable">
                        Elan mövcud deyil
                      </span>
                    )}
                  </div>

                  <div className="car-info">
                    <h3>{car.brand} {car.model}</h3>

                    <p className="car-year">
                      {car.year} · {getFuel(car.fuelType)}
                    </p>

                    <div className="car-details">
                      <span>◷ {formatPrice(car.mileage)} km</span>
                      <span>{getTransmission(car.transmission)}</span>
                    </div>

                    <div className="car-card-bottom">
                      <h4>
                        {formatPrice(car.price)} <small>AZN</small>
                      </h4>

                      <button
                        type="button"
                        className="favorite-remove-button"
                        onClick={() => toggleFavorite(car.id)}
                        title="Favoritlərdən çıxar"
                        aria-label="Favoritlərdən çıxar"
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Favorites;
