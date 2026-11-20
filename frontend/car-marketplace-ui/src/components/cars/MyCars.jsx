
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
            Yerləşdirdiyiniz avtomobil elanlarını buradan idarə edə bilərsiniz.
          </p>
        </div>

        {error && (
          <div className="status-message error">
            {error}
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
