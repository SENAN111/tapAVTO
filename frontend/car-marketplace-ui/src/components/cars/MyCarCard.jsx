
import {
  formatPrice,
  getBodyType,
  getCarStatus,
  getStatusLabel,
  getPrimaryImage,
} from "../../utils/carUtils";

function MyCarCard({
  car,
  carImages,
  openEditForm,
  openCarDetails,
  handleDeleteCar,
}) {
  const status = getCarStatus(car);
  const primaryImage = getPrimaryImage(car, carImages);

  return (
    <article
      className="my-car-card"
      onClick={() => openCarDetails(car)}
      style={{ cursor: "pointer" }}
    >
      <div className="my-car-image">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${car.brand} ${car.model}`}
          />
        ) : (
          <div className="no-image">Şəkil yoxdur</div>
        )}
      </div>

      <div className="my-car-info">
        <div className="my-car-title-row">
          <h3>
            {car.brand} {car.model}
          </h3>

          <span
            className={`status-badge ${
              status === "PUBLISHED"
                ? "status-published"
                : status === "DRAFT"
                  ? "status-draft"
                  : "status-unknown"
            }`}
          >
            {getStatusLabel(car)}
          </span>
        </div>

        <p>
          {car.year} · {getBodyType(car.bodyType)}
        </p>

        <strong className="my-car-price">
          {formatPrice(car.price)} AZN
        </strong>

        <div
          className="my-car-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="listing-primary"
            onClick={() => openEditForm(car)}
          >
            Redaktə et
          </button>

          <button
            type="button"
            className="my-car-view"
            onClick={() => openCarDetails(car)}
          >
            Bax
          </button>

          <button
            type="button"
            className="my-car-delete"
            onClick={() => handleDeleteCar(car)}
          >
            Sil
          </button>
        </div>
      </div>
    </article>
  );
}

export default MyCarCard;
