
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
    token,
}) {
    const [favoriteCars, setFavoriteCars] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadFavorites() {
            if (!favoriteIds.length) {
                setFavoriteCars([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const results = await Promise.all(
                    favoriteIds.map(async (id) => {
                        try {
                            return await fetchCarById(id, token);
                        } catch (error) {
                            console.error(
                                `Avtomobil ${id} yüklənmədi:`,
                                error
                            );

                            return {
                                id,
                                status: "UNAVAILABLE",
                            };
                        }
                    })
                );

                if (!cancelled) {
                    setFavoriteCars(results);
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
    }, [favoriteIds, token]);

    if (loading) {
        return (
            <section className="favorites-section">
                <div className="container">
                    <p className="status-message">
                        Favoritlər yüklənir...
                    </p>
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
                            const isDeleted = car.status === "DELETED";
                            const isUnavailable =
                                car.status === "UNAVAILABLE";

                            const imageUrl =
                                car.imageUrls?.[0] ||
                                car.images?.[0]?.imageUrl;

                            return (
                                <article
                                    className={`car-card favorite-car-card ${
                                        isDeleted ? "deleted-favorite-card" : ""
                                    }`}
                                    key={car.id}
                                >
                                    <div
                                        className="car-image"
                                        onClick={() => openCarDetails(car)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={`${car.brand || ""} ${car.model || ""}`}
                                            />
                                        ) : (
                                            <div className="no-image">
                                                Şəkil yoxdur
                                            </div>
                                        )}

                                        {isDeleted && (
                                            <span className="favorite-unavailable">
                                                Elan mövcud deyil
                                            </span>
                                        )}

                                        {isUnavailable && (
                                            <span className="favorite-unavailable">
                                                Elan mövcud deyil
                                            </span>
                                        )}
                                    </div>

                                    <div className="car-info">
                                        <h3>
                                            {car.brand || "Avtomobil"}{" "}
                                            {car.model || ""}
                                        </h3>

                                        {!isUnavailable && (
                                            <>
                                                <p className="car-year">
                                                    {car.year} ·{" "}
                                                    {getFuel(car.fuelType)}
                                                </p>

                                                <div className="car-details">
                                                    <span>
                                                        ◷{" "}
                                                        {formatPrice(car.mileage)} km
                                                    </span>

                                                    <span>
                                                        {getTransmission(
                                                            car.transmission
                                                        )}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {isUnavailable && (
                                            <p className="car-year">
                                                Avtomobil məlumatları yüklənmədi.
                                            </p>
                                        )}

                                        <div className="car-card-bottom">
                                            {!isUnavailable && (
                                                <h4>
                                                    {formatPrice(car.price)}{" "}
                                                    <small>AZN</small>
                                                </h4>
                                            )}

                                            <button
                                                type="button"
                                                className="favorite-remove-button"
                                                onClick={() =>
                                                    toggleFavorite(car.id)
                                                }
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
