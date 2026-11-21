import { cities } from "../../data/carData";
function CarFormModal({
  showCarForm,
  closeCarForm,
  editingCarId,
  draftCarId,
  setDraftCarId,
  brands,
  carModels,
  brandChoice,
  handleBrandChange,
  modelChoice,
  handleModelChange,
  carForm,
  handleCarChange,
  bodyTypes,
  colorChoice,
  handleColorChange,
  carColors,
  phonePrefix,
  handlePhonePrefixChange,
  phonePrefixes,
  phoneNumber,
  handlePhoneNumberChange,
  carFormError,
  carFormLoading,
  handleCarSubmit,
  selectedFiles,
  uploadedImageCount,
  handleFilesChange,
  imageError,
  uploading,
  publishing,
  setSelectedFiles,
  setUploadedImageCount,
  setImageError,
  handleImageUpload,
  handlePublishCar,
}) {
  if (!showCarForm) return null;

  return (
    <div
      className="listing-backdrop"
      onClick={closeCarForm}
    >
      <div
        className="listing-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="listing-close"
          onClick={closeCarForm}
          aria-label="Bağla"
        >
          ×
        </button>

        <div className="listing-header">
          <p className="eyebrow">CAR MARKETPLACE</p>
          <h2>
            {editingCarId
              ? "Elanı redaktə et"
              : draftCarId
                ? "Avtomobil şəkilləri"
                : "Yeni avtomobil elanı"}
          </h2>
          <p>
            {editingCarId
              ? "Avtomobil məlumatlarını yeniləyin."
              : draftCarId
                ? "Şəkilləri əlavə edin və elanınızı yayımlayın."
                : "Avtomobiliniz haqqında məlumatları daxil edin."}
          </p>
        </div>

        {!editingCarId && (
          <div className="listing-steps">
            <div
              className={`listing-step ${!draftCarId ? "active" : "completed"}`}
            >
              <span>{draftCarId ? "✓" : "1"}</span>
              <div>
                <strong>Avtomobil məlumatları</strong>
                <small>Elan məlumatları</small>
              </div>
            </div>

            <div className="listing-step-line" />

            <div className={`listing-step ${draftCarId ? "active" : ""}`}>
              <span>2</span>
              <div>
                <strong>Şəkillər</strong>
                <small>Minimum 5 şəkil</small>
              </div>
            </div>
          </div>
        )}

        {!draftCarId || editingCarId ? (
          <form className="listing-form-grid" onSubmit={handleCarSubmit}>
            <div className="listing-field">
              <label>Avtomobil markası</label>
              <select
                value={brandChoice}
                onChange={handleBrandChange}
                required
              >
                <option value="">Marka seçin</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === "Land_Rover" ? "Land Rover" : brand}
                  </option>
                ))}
                <option value="__OTHER__">Digər marka</option>
              </select>
            </div>

            {brandChoice === "__OTHER__" && (
              <div className="listing-field">
                <label>Markanın adı</label>
                <input
                  name="brand"
                  placeholder="Markanın adını daxil edin"
                  value={carForm.brand}
                  onChange={handleCarChange}
                  maxLength={50}
                  required
                />
              </div>
            )}

            {brandChoice && brandChoice !== "__OTHER__" && (
              <div className="listing-field">
                <label>Avtomobil modeli</label>
                <select
                  value={modelChoice}
                  onChange={handleModelChange}
                  required
                >
                  <option value="">Model seçin</option>
                  {(carModels[brandChoice] || []).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  <option value="__OTHER__">Digər model</option>
                </select>
              </div>
            )}

            {modelChoice === "__OTHER__" && (
              <div className="listing-field">
                <label>Modelin adı</label>
                <input
                  name="model"
                  placeholder="Modelin adını daxil edin"
                  value={carForm.model}
                  onChange={handleCarChange}
                  maxLength={50}
                  required
                />
              </div>
            )}

            {brandChoice === "__OTHER__" && (
              <div className="listing-field">
                <label>Avtomobil modeli</label>
                <input
                  name="model"
                  placeholder="Modelin adını daxil edin"
                  value={carForm.model}
                  onChange={handleCarChange}
                  maxLength={50}
                  required
                />
              </div>
            )}

            <div className="listing-field">
              <label>Buraxılış ili</label>
              <input
                name="year"
                type="number"
                placeholder="Məsələn: 2020"
                min="1886"
                max={new Date().getFullYear()}
                value={carForm.year}
                onChange={handleCarChange}
                required
              />
            </div>

            <div className="listing-field">
              <label>Qiymət (AZN)</label>
              <input
                name="price"
                type="number"
                placeholder="Məsələn: 25000"
                min="0.01"
                step="0.01"
                value={carForm.price}
                onChange={handleCarChange}
                required
              />
            </div>

            <div className="listing-field">
              <label>Yürüş (km)</label>
              <input
                name="mileage"
                type="number"
                placeholder="Məsələn: 85000"
                min="0"
                step="1"
                value={carForm.mileage}
                onChange={handleCarChange}
                required
              />
            </div>

            <div className="listing-field">
              <label>Mühərrikin gücü (at gücü)</label>
              <input
                name="horsePower"
                type="number"
                placeholder="Məsələn: 170"
                min="1"
                max="2000"
                step="1"
                value={carForm.horsePower}
                onChange={handleCarChange}
                required
              />
            </div>

            <div className="listing-field">
              <label>Mühərrikin həcmi (L)</label>
              <input
                name="engineVolume"
                type="number"
                placeholder="Məsələn: 2.0"
                min="0.1"
                max="99.9"
                step="0.1"
                value={carForm.engineVolume}
                onChange={handleCarChange}
                required
              />
            </div>

           <div className="listing-field">
             <label>Yanacaq növü</label>
             <select
               name="fuelType"
               value={carForm.fuelType}
               onChange={handleCarChange}
               required
             >
               <option value="PETROL">Benzin</option>
               <option value="DIESEL">Dizel</option>
               <option value="HYBRID">Hibrid</option>
               <option value="PLUG_IN_HYBRID">Plug-in Hibrid</option>
               <option value="ELECTRIC">Elektrik</option>
               <option value="LPG">Qaz (LPG)</option>
             </select>
           </div>

            <div className="listing-field">
              <label>Sürətlər qutusu</label>
              <select
                name="transmission"
                value={carForm.transmission}
                onChange={handleCarChange}
                required
              >
                <option value="AUTOMATIC">Avtomat</option>
                <option value="MANUAL">Mexaniki</option>
                <option value="ROBOT">Robot</option>
                <option value="CVT">Variator (CVT)</option>
              </select>
            </div>

            <div className="listing-field">
              <label>Ban növü</label>
              <select
                name="bodyType"
                value={carForm.bodyType}
                onChange={handleCarChange}
                required
              >
                <option value="">Ban növünü seçin</option>
                {bodyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="listing-field">
              <label>Avtomobilin rəngi</label>
              <select
                value={colorChoice}
                onChange={handleColorChange}
                required
              >
                <option value="">Rəng seçin</option>
                {carColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {colorChoice === "Digər" && (
              <div className="listing-field">
                <label>Rəngin adı</label>
                <input
                  type="text"
                  name="color"
                  placeholder="Rəngi daxil edin"
                  maxLength="50"
                  value={carForm.color}
                  onChange={handleCarChange}
                  required
                />
              </div>
            )}

           <div className="listing-field full-width">
             <label>Şəhər</label>
             <select
               name="location"
               value={carForm.location}
               onChange={handleCarChange}
               required
             >
               <option value="">Şəhər seçin</option>
               {cities.map((city) => (
                 <option key={city} value={city}>
                   {city}
                 </option>
               ))}
             </select>
           </div>

            <div className="listing-field full-width">
              <label>Avtomobil haqqında məlumat</label>
              <textarea
                name="description"
                placeholder="Avtomobilin vəziyyəti və digər xüsusiyyətləri haqqında məlumat yazın..."
                maxLength="2000"
                rows="4"
                value={carForm.description}
                onChange={handleCarChange}
              />
              <small>{carForm.description.length}/2000 simvol</small>
            </div>

            <div className="listing-field full-width">
              <label>Əlaqə telefon nömrəsi</label>

              <div className="phone-input-group">
                <select
                  value={phonePrefix}
                  onChange={handlePhonePrefixChange}
                  aria-label="Mobil operator prefiksi"
                  required
                >
                  {phonePrefixes.map((prefix) => (
                    <option key={prefix.value} value={prefix.value}>
                      {prefix.label}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  placeholder="1234567"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  inputMode="numeric"
                  maxLength={7}
                  pattern="[0-9]{7}"
                  title="Telefon nömrəsinin son 7 rəqəmini daxil edin"
                  required
                />
              </div>

              <small>
                Operatoru seçin və nömrənin son 7 rəqəmini daxil edin.
              </small>

              <small>
                Tam nömrə: {phonePrefix} {phoneNumber || "XXXXXXX"}
              </small>
            </div>

            {carFormError && (
              <p className="listing-error full-width">{carFormError}</p>
            )}

            <div className="listing-actions full-width">
              <button
                type="button"
                className="listing-cancel"
                onClick={closeCarForm}
              >
                Ləğv et
              </button>

              <button
                type="submit"
                className="listing-primary"
                disabled={carFormLoading}
              >
                {carFormLoading
                  ? "Yadda saxlanılır..."
                  : editingCarId
                    ? "Dəyişiklikləri yadda saxla"
                    : "Davam et →"}
              </button>
            </div>
          </form>
        ) : (
          <div className="listing-upload">
            <div className="upload-summary">
              <div className="upload-summary-icon">📸</div>
              <div>
                <h3>Avtomobil şəkillərini əlavə edin</h3>
                <p>
                  Keyfiyyətli şəkillər elanınızın daha çox diqqət
                  çəkməsinə kömək edir.
                </p>
              </div>
            </div>

            <div className="upload-stats">
              <div>
                <strong>{selectedFiles.length}/10</strong>
                <span>Seçilmiş şəkillər</span>
              </div>
              <div>
                <strong>{uploadedImageCount}/5</strong>
                <span>Minimum yüklənmə</span>
              </div>
            </div>

            <label className="upload-zone" htmlFor="car-images">
              <span className="upload-icon">＋</span>
              <strong>Şəkilləri seçin</strong>
              <span>JPG, PNG və digər şəkil formatları</span>
              <small>Minimum 5, maksimum 10 şəkil</small>
            </label>

            <input
              id="car-images"
              className="upload-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              disabled={uploading || publishing}
            />

            {selectedFiles.length > 0 && (
              <div className="listing-preview-grid">
                {selectedFiles.map((file, index) => (
                  <div
                    className="listing-preview-item"
                    key={`${file.name}-${index}`}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Şəkil ${index + 1}`}
                    />
                    <span className={index < uploadedImageCount ? "uploaded" : ""}>
                      {index < uploadedImageCount
                        ? "✓ Yükləndi"
                        : `Şəkil ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {imageError && (
              <p className="listing-error">{imageError}</p>
            )}

            <div className="listing-progress">
              <div
                style={{
                  width: `${Math.min((uploadedImageCount / 5) * 100, 100)}%`,
                }}
              />
            </div>

            <p className="upload-progress-text">
              {uploadedImageCount >= 5
                ? "Minimum şəkil sayı tamamlandı."
                : `Yayımlamaq üçün daha ${5 - uploadedImageCount} şəkil yükləməlisiniz.`}
            </p>

            <div className="listing-actions">
              <button
                type="button"
                className="listing-cancel"
                onClick={() => {
                  setDraftCarId(null);
                  setSelectedFiles([]);
                  setUploadedImageCount(0);
                  setImageError("");
                }}
                disabled={uploading || publishing}
              >
                Geri
              </button>

              <button
                type="button"
                className="listing-primary"
                onClick={handleImageUpload}
                disabled={
                  uploading ||
                  publishing ||
                  selectedFiles.length < 5 ||
                  uploadedImageCount >= selectedFiles.length
                }
              >
                {uploading
                  ? `Yüklənir... (${uploadedImageCount}/${selectedFiles.length})`
                  : "Şəkilləri yüklə"}
              </button>
            </div>

            <button
              type="button"
              className="listing-publish"
              onClick={handlePublishCar}
              disabled={
                uploadedImageCount < 5 ||
                uploading ||
                publishing
              }
            >
              {publishing
                ? "Elan yayımlanır..."
                : uploadedImageCount >= 5
                  ? "✓ Elanı yayımla"
                  : `Elanı yayımla (${uploadedImageCount}/5)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarFormModal;
