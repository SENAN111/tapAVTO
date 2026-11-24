
import MyCarCard from "./MyCarCard";

function MyCars({
    goHome,
    error,
    myCars,
    openCarForm,
    carImages,
    openEditForm,
    openCarDetails,
    handleDeleteCar,
}) {
    const pendingCount = myCars.filter(
        (car) => car.status === "PENDING"
    ).length;

    const approvedCount = myCars.filter(
        (car) =>
            car.status === "APPROVED" ||
            car.status === "PUBLISHED"
    ).length;

    const rejectedCount = myCars.filter(
        (car) => car.status === "REJECTED"
    ).length;

    const draftCount = myCars.filter(
        (car) => car.status === "DRAFT"
    ).length;

    return (
        <main className="my-cars-page">
            <div className="container">

                <button
                    type="button"
                    className="back-button"
                    onClick={goHome}
                >
                    ← Ana səhifəyə qayıt
                </button>

                <div className="my-cars-header">
                    <p className="eyebrow">ŞƏXSİ KABİNET</p>

                    <h1>Elanlarım</h1>

                    <p>
                        Yerləşdirdiyiniz avtomobil elanlarını buradan
                        idarə edə bilərsiniz.
                    </p>
                </div>

                {error && (
                    <div className="status-message error">
                        {error}
                    </div>
                )}

                {myCars.length > 0 && (
                    <div className="my-cars-statistics">

                        <div className="my-cars-stat">
                            <span className="stat-number">
                                {myCars.length}
                            </span>
                            <span className="stat-label">
                                Ümumi elan
                            </span>
                        </div>

                        <div className="my-cars-stat">
                            <span className="stat-number">
                                {approvedCount}
                            </span>
                            <span className="stat-label">
                                Təsdiqlənmiş
                            </span>
                        </div>

                        <div className="my-cars-stat">
                            <span className="stat-number">
                                {pendingCount}
                            </span>
                            <span className="stat-label">
                                Yoxlamada
                            </span>
                        </div>

                        <div className="my-cars-stat">
                            <span className="stat-number">
                                {rejectedCount}
                            </span>
                            <span className="stat-label">
                                Rədd edilmiş
                            </span>
                        </div>

                        <div className="my-cars-stat">
                            <span className="stat-number">
                                {draftCount}
                            </span>
                            <span className="stat-label">
                                Qaralama
                            </span>
                        </div>

                    </div>
                )}

                {myCars.length === 0 ? (
                    <div className="status-message">
                        Hələ heç bir elanınız yoxdur.

                        <button
                            type="button"
                            onClick={openCarForm}
                        >
                            Elan əlavə et
                        </button>
                    </div>
                ) : (
                    <div className="my-cars-grid">
                        {myCars.map((car) => (
                            <MyCarCard
                                key={car.id}
                                car={car}
                                carImages={carImages}
                                openEditForm={openEditForm}
                                openCarDetails={openCarDetails}
                                handleDeleteCar={handleDeleteCar}
                            />
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}

export default MyCars;
