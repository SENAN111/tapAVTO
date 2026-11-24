
import React from "react";
import {
    formatPrice,
    getBodyType,
    getCarStatus,
    getStatusLabel,
    getPrimaryImage
} from "../../utils/carUtils";

const MyCarCard = ({
    car,
    carImages,
    openEditForm,
    openCarDetails,
    handleDeleteCar
}) => {

    const status = car.status || getCarStatus(car);
    const statusLabel = getStatusLabel(status);

    const getStatusClass = () => {
        switch (status) {
            case "APPROVED":
            case "PUBLISHED":
                return "status-published";

            case "PENDING":
                return "status-pending";

            case "REJECTED":
                return "status-rejected";

            case "DRAFT":
                return "status-draft";

            default:
                return "status-unknown";
        }
    };

    const image = getPrimaryImage(car, carImages);

    const handleDelete = () => {
        const confirmed = window.confirm(
            "Bu elanı silmək istədiyinizə əminsiniz?"
        );

        if (confirmed) {
            handleDeleteCar(car.id);
        }
    };

    return (
        <div className="my-car-card">

            <div className="my-car-image">
                {image ? (
                    <img
                        src={image}
                        alt={`${car.brand} ${car.model}`}
                    />
                ) : (
                    <div className="no-image">
                        Şəkil yoxdur
                    </div>
                )}
            </div>

            <div className="my-car-info">

                <div className="my-car-title-row">
                    <h3 className="my-car-title">
                        {car.brand} {car.model}
                    </h3>

                    <span className={`status-badge ${getStatusClass()}`}>
                        {statusLabel}
                    </span>
                </div>

                <div className="my-car-details">
                    <span>{car.year}</span>

                    {car.bodyType && (
                        <span>{getBodyType(car.bodyType)}</span>
                    )}
                </div>

                <div className="my-car-price">
                    {formatPrice(car.price)}
                </div>

                {status === "REJECTED" && car.rejectionReason && (
                    <div className="rejection-reason">
                        <strong>Rədd edilmə səbəbi:</strong>
                        <p>{car.rejectionReason}</p>
                    </div>
                )}

                {status === "PENDING" && (
                    <div className="pending-message">
                        Elanınız admin yoxlamasındadır.
                    </div>
                )}

                {status === "APPROVED" || status === "PUBLISHED" ? (
                    <div className="approved-message">
                        Elanınız təsdiqlənib və saytda yayımlanıb.
                    </div>
                ) : null}

                <div className="my-car-actions">

                    <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEditForm(car)}
                        disabled={status === "PENDING"}
                    >
                        Redaktə et
                    </button>

                    <button
                        type="button"
                        className="view-button"
                        onClick={() => openCarDetails(car)}
                    >
                        Bax
                    </button>

                    <button
                        type="button"
                        className="delete-button"
                        onClick={handleDelete}
                    >
                        Sil
                    </button>

                </div>

            </div>

        </div>
    );
};

export default MyCarCard;
