
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
    editRequests = [],
    editRequestsLoading = false,
    openEditForm,
    openCarDetails,
    handleDeleteCar
}) => {
    const status = car.status || getCarStatus(car);
    const statusLabel = getStatusLabel(status);

    const pendingEditRequest = editRequests.find(
        (request) => request.status === "PENDING"
    );

    const rejectedEditRequest = editRequests.find(
        (request) => request.status === "REJECTED"
    );

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

            case "DELETED":
                return "status-deleted";

            default:
                return "status-unknown";
        }
    };

    const image = getPrimaryImage(car, carImages);

    const handleDelete = () => {
        if (!car || !car.id) {
            alert("Avtomobil məlumatları və ya ID-si tapılmadı.");
            return;
        }

        handleDeleteCar(car);
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

                {(status === "APPROVED" || status === "PUBLISHED") && (
                    <div className="approved-message">
                        Elanınız təsdiqlənib və saytda yayımlanıb.
                    </div>
                )}

                {pendingEditRequest && (
                    <div className="pending-message">
                        <strong>Redaktə sorğusu göndərilib.</strong>
                        <p>Redaktə etdiyiniz məlumatlar admin yoxlamasındadır.</p>
                    </div>
                )}

                {rejectedEditRequest && !pendingEditRequest && (
                    <div className="rejection-reason">
                        <strong>Redaktə sorğusu rədd edilib.</strong>
                        {rejectedEditRequest.rejectionReason && (
                            <p>{rejectedEditRequest.rejectionReason}</p>
                        )}
                    </div>
                )}

                {editRequestsLoading && (
                    <div className="pending-message">
                        Redaktə sorğuları yüklənir...
                    </div>
                )}

                <div className="my-car-actions">

                    <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEditForm(car)}
                        disabled={
                            status === "PENDING" ||
                            status === "DELETED" ||
                            Boolean(pendingEditRequest)
                        }
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
                        disabled={status === "DELETED"}
                    >
                        Sil
                    </button>

                </div>

            </div>

        </div>
    );
};

export default MyCarCard;
