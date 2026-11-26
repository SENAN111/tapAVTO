
import { cities } from "../../data/carData";

const carFeatures = [
    { value: "SUNROOF", label: "Lyuk" },
    { value: "HEATED_SEATS", label: "Oturacaqların isidilməsi" },
    { value: "HEATED_STEERING_WHEEL", label: "Sükanın isidilməsi" },
    { value: "REAR_CAMERA", label: "Arxa görüntü kamerası" },
    { value: "PARKING_SENSORS", label: "Park radarları" },
    { value: "CRUISE_CONTROL", label: "Kruiz-kontrol" },
    { value: "AIR_CONDITIONING", label: "Kondisioner" },
    { value: "CLIMATE_CONTROL", label: "İqlim kontrolu" },
    { value: "LEATHER_SEATS", label: "Dəri salon" },
    { value: "PANORAMIC_ROOF", label: "Panoramik tavan" },
    { value: "RAIN_SENSOR", label: "Yağış sensoru" },
    { value: "LIGHT_SENSOR", label: "İşıq sensoru" },
];

function CarFormModal({
    showCarForm,
    closeCarForm,
    editingCarId,
    editingCarStatus,
    pendingEditRequestId,
    uploadedEditImageCount = 0,
    existingImageCount = 0,
    stagedEditImageCount = 0,
    draftCarId,
    setDraftCarId,
    brands = [],
    carModels = [],
    modelsLoading = false,
    brandChoice,
    handleBrandChange,
    modelChoice,
    handleModelChange,
    carForm,
    handleCarChange,
    handleFeatureChange,
    bodyTypes = [],
    colorChoice,
    handleColorChange,
    carColors = [],
    phonePrefix,
    handlePhonePrefixChange,
    phonePrefixes = [],
    phoneNumber,
    handlePhoneNumberChange,
    carFormError,
    carFormLoading,
    handleCarSubmit,
    selectedFiles = [],
    uploadedImageCount = 0,
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

    const safeBrands = Array.isArray(brands) ? brands : [];
    const safeCarModels = Array.isArray(carModels) ? carModels : [];
    const safeBodyTypes = Array.isArray(bodyTypes) ? bodyTypes : [];
    const safeCarColors = Array.isArray(carColors) ? carColors : [];
    const safePhonePrefixes = Array.isArray(phonePrefixes) ? phonePrefixes : [];
    const safeSelectedFiles = Array.isArray(selectedFiles) ? selectedFiles : [];
    const safeCities = Array.isArray(cities) ? cities : [];
    const selectedFeatures = Array.isArray(carForm?.features)
        ? carForm.features
        : [];

    const descriptionLength = (carForm?.description || "").length;

    const isEditRequest =
        editingCarId &&
        ["APPROVED", "PUBLISHED"].includes(editingCarStatus);

    const isEditRequestPending = Boolean(pendingEditRequestId);

    const maxAdditionalImages = Math.max(
        0,
        10 - existingImageCount - stagedEditImageCount
    );

    const totalSelectedEditImages =
        existingImageCount +
        stagedEditImageCount +
        safeSelectedFiles.length;

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
                    <p className="eyebrow">TAPAVTO</p>

                    <h2>
                        {editingCarId
                            ? "Elanı redaktə et"
                            : draftCarId
                                ? "Avtomobil şəkilləri"
                                : "Yeni avtomobil elanı"}
                    </h2>

                    <p>
                        {isEditRequest
                            ? isEditRequestPending
                                ? "Redaktə sorğusu yaradılıb. Şəkil yükləməsini davam etdirə bilərsiniz."
                                : "Dəyişikliklər admin tərəfindən yoxlanıldıqdan sonra elana tətbiq olunacaq."
                            : editingCarId
                                ? "Avtomobil məlumatlarını yeniləyin."
                                : draftCarId
                                    ? "Şəkilləri əlavə edin və elanınızı admin yoxlamasına göndərin."
                                    : "Avtomobiliniz haqqında məlumatları daxil edin."}
                    </p>
                </div>

                {!editingCarId && (
                    <div className="listing-steps">
                        <div
                            className={`listing-step ${
                                !draftCarId ? "active" : "completed"
                            }`}
                        >
                            <span>{draftCarId ? "✓" : "1"}</span>
                            <div>
                                <strong>Avtomobil məlumatları</strong>
                                <small>Elan məlumatları</small>
                            </div>
                        </div>

                        <div className="listing-step-line" />

                        <div
                            className={`listing-step ${
                                draftCarId ? "active" : ""
                            }`}
                        >
                            <span>2</span>
                            <div>
                                <strong>Şəkillər</strong>
                                <small>Minimum 5 şəkil</small>
                            </div>
                        </div>
                    </div>
                )}

                {!draftCarId || editingCarId ? (
                    <form
                        className="listing-form-grid"
                        onSubmit={handleCarSubmit}
                    >
                        <div className="listing-field">
                            <label>Avtomobil markası</label>

                            <select
                                value={brandChoice || ""}
                                onChange={handleBrandChange}
                                required
                                disabled={isEditRequestPending}
                            >
                                <option value="">Marka seçin</option>

                                {safeBrands.map((brand) => (
                                    <option key={brand} value={brand}>
                                        {brand === "Land_Rover"
                                            ? "Land Rover"
                                            : brand}
                                    </option>
                                ))}

                                <option value="__OTHER__">
                                    Digər marka
                                </option>
                            </select>
                        </div>

                        {brandChoice === "__OTHER__" && (
                            <div className="listing-field">
                                <label>Markanın adı</label>
                                <input
                                    name="brand"
                                    placeholder="Markanın adını daxil edin"
                                    value={carForm.brand || ""}
                                    onChange={handleCarChange}
                                    maxLength={50}
                                    required
                                    disabled={isEditRequestPending}
                                />
                            </div>
                        )}

                        {brandChoice && brandChoice !== "__OTHER__" && (
                            <div className="listing-field">
                                <label>Avtomobil modeli</label>

                                <select
                                    value={modelChoice || ""}
                                    onChange={handleModelChange}
                                    required
                                    disabled={isEditRequestPending}
                                >
                                    <option value="">Model seçin</option>

                                    {modelsLoading ? (
                                        <option value="" disabled>
                                            Modellər yüklənir...
                                        </option>
                                    ) : (
                                        safeCarModels.map((model) => (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        ))
                                    )}

                                    <option value="__OTHER__">
                                        Digər model
                                    </option>
                                </select>
                            </div>
                        )}

                        {modelChoice === "__OTHER__" && (
                            <div className="listing-field">
                                <label>Modelin adı</label>
                                <input
                                    name="model"
                                    placeholder="Modelin adını daxil edin"
                                    value={carForm.model || ""}
                                    onChange={handleCarChange}
                                    maxLength={50}
                                    required
                                    disabled={isEditRequestPending}
                                />
                            </div>
                        )}

                        {brandChoice === "__OTHER__" && (
                            <div className="listing-field">
                                <label>Avtomobil modeli</label>
                                <input
                                    name="model"
                                    placeholder="Modelin adını daxil edin"
                                    value={carForm.model || ""}
                                    onChange={handleCarChange}
                                    maxLength={50}
                                    required
                                    disabled={isEditRequestPending}
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
                                value={carForm.year || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
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
                                value={carForm.price || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
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
                                value={carForm.mileage || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
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
                                value={carForm.horsePower || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
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
                                value={carForm.engineVolume || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
                            />
                        </div>

                        <div className="listing-field">
                            <label>Yanacaq növü</label>
                            <select
                                name="fuelType"
                                value={carForm.fuelType || "PETROL"}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
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
                                value={carForm.transmission || "AUTOMATIC"}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
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
                                value={carForm.bodyType || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
                            >
                                <option value="">Ban növünü seçin</option>

                                {safeBodyTypes.map((type) => (
                                    <option
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="listing-field">
                            <label>Oturacaq sayı</label>
                            <select
                                name="seatCount"
                                value={carForm.seatCount || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
                            >
                                <option value="">Oturacaq sayını seçin</option>
                                <option value="TWO">2 oturacaq</option>
                                <option value="THREE">3 oturacaq</option>
                                <option value="FOUR">4 oturacaq</option>
                                <option value="FIVE">5 oturacaq</option>
                                <option value="SIX">6 oturacaq</option>
                                <option value="SEVEN">7 oturacaq</option>
                                <option value="EIGHT">8 oturacaq</option>
                                <option value="NINE">9 oturacaq</option>
                            </select>
                        </div>

                        <div className="listing-field">
                            <label>Ötürücü növü</label>
                            <select
                                name="drivetrain"
                                value={carForm.drivetrain || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
                            >
                                <option value="">Ötürücü növünü seçin</option>
                                <option value="FWD">Ön ötürücü (FWD)</option>
                                <option value="RWD">Arxa ötürücü (RWD)</option>
                                <option value="AWD">Tam ötürücü (AWD)</option>
                                <option value="4WD">4x4 (4WD)</option>
                            </select>
                        </div>

                        <div className="listing-field">
                            <label>Avtomobilin rəngi</label>
                            <select
                                value={colorChoice || ""}
                                onChange={handleColorChange}
                                required
                                disabled={isEditRequestPending}
                            >
                                <option value="">Rəng seçin</option>

                                {safeCarColors.map((color) => (
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
                                    maxLength={50}
                                    value={carForm.color || ""}
                                    onChange={handleCarChange}
                                    required
                                    disabled={isEditRequestPending}
                                />
                            </div>
                        )}

                        <div className="listing-field full-width">
                            <label>Şəhər</label>
                            <select
                                name="location"
                                value={carForm.location || ""}
                                onChange={handleCarChange}
                                required
                                disabled={isEditRequestPending}
                            >
                                <option value="">Şəhər seçin</option>

                                {safeCities.map((city) => (
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
                                maxLength={2000}
                                rows={4}
                                value={carForm.description || ""}
                                onChange={handleCarChange}
                                disabled={isEditRequestPending}
                            />
                            <small>{descriptionLength}/2000 simvol</small>
                        </div>

                        {/* Avtomobilin təchizatı */}
                        <div className="listing-field full-width">
                            <div className="car-features-heading">
                                <label>Avtomobilin təchizatı</label>
                                <small>
                                    Avtomobildə mövcud olan təchizatları seçin.
                                </small>
                            </div>

                            <div className="car-features-grid">
                                {carFeatures.map((feature) => (
                                    <label
                                        key={feature.value}
                                        className={`car-feature-option ${
                                            selectedFeatures.includes(feature.value)
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFeatures.includes(
                                                feature.value
                                            )}
                                            onChange={(event) =>
                                                handleFeatureChange?.(
                                                    feature.value,
                                                    event.target.checked
                                                )
                                            }
                                            disabled={isEditRequestPending}
                                        />

                                        <span className="car-feature-check">
                                            ✓
                                        </span>

                                        <span>{feature.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="listing-field full-width">
                            <label>Əlaqə telefon nömrəsi</label>

                            <div className="phone-input-group">
                                <select
                                    value={phonePrefix || ""}
                                    onChange={handlePhonePrefixChange}
                                    aria-label="Mobil operator prefiksi"
                                    required
                                    disabled={isEditRequestPending}
                                >
                                    {safePhonePrefixes.map((prefix) => (
                                        <option
                                            key={prefix.value}
                                            value={prefix.value}
                                        >
                                            {prefix.label}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="tel"
                                    placeholder="1234567"
                                    value={phoneNumber || ""}
                                    onChange={handlePhoneNumberChange}
                                    inputMode="numeric"
                                    maxLength={7}
                                    pattern="[0-9]{7}"
                                    title="Telefon nömrəsinin son 7 rəqəmini daxil edin"
                                    required
                                    disabled={isEditRequestPending}
                                />
                            </div>

                            <small>
                                Operatoru seçin və nömrənin son 7 rəqəmini daxil edin.
                            </small>
                            <small>
                                Tam nömrə: {phonePrefix} {phoneNumber || "XXXXXXX"}
                            </small>
                        </div>

                        {isEditRequest && (
                            <div className="listing-field full-width">
                                <label>Əlavə şəkillər (məcburi deyil)</label>

                                <p>
                                    Mövcud şəkillər saxlanılacaq. Seçdiyiniz
                                    yeni şəkillər admin təsdiqindən sonra
                                    elana əlavə ediləcək.
                                </p>

                                <div className="upload-stats">
                                    <div>
                                        <strong>{existingImageCount}/10</strong>
                                        <span>Mövcud şəkillər</span>
                                    </div>
                                    <div>
                                        <strong>{stagedEditImageCount}/10</strong>
                                        <span>Sorğuya yüklənmiş şəkillər</span>
                                    </div>
                                    <div>
                                        <strong>
                                            {safeSelectedFiles.length}/{maxAdditionalImages}
                                        </strong>
                                        <span>Yeni seçilmiş şəkillər</span>
                                    </div>
                                    <div>
                                        <strong>
                                            {uploadedEditImageCount}/{safeSelectedFiles.length}
                                        </strong>
                                        <span>Bu sessiyada yüklənmiş şəkillər</span>
                                    </div>
                                </div>

                                {maxAdditionalImages > 0 ? (
                                    <>
                                        <label
                                            className="upload-zone"
                                            htmlFor="edit-request-images"
                                        >
                                            <span className="upload-icon">＋</span>
                                            <strong>Yeni şəkillər seçin</strong>
                                            <span>JPG, PNG və digər şəkil formatları</span>
                                            <small>
                                                Daha {maxAdditionalImages} şəkil əlavə edə bilərsiniz
                                            </small>
                                        </label>

                                        <input
                                            id="edit-request-images"
                                            className="upload-file-input"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFilesChange}
                                            disabled={
                                                carFormLoading ||
                                                totalSelectedEditImages >= 10
                                            }
                                        />
                                    </>
                                ) : (
                                    <p className="listing-error">
                                        Elan artıq maksimum 10 şəkilə malikdir.
                                        Əlavə şəkil seçmək mümkün deyil.
                                    </p>
                                )}

                                {safeSelectedFiles.length > 0 && (
                                    <div className="listing-preview-grid">
                                        {safeSelectedFiles.map((file, index) => (
                                            <div
                                                className="listing-preview-item"
                                                key={`${file.name}-${index}`}
                                            >
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Yeni şəkil ${index + 1}`}
                                                />
                                                <span
                                                    className={
                                                        index < uploadedEditImageCount
                                                            ? "uploaded"
                                                            : ""
                                                    }
                                                >
                                                    {index < uploadedEditImageCount
                                                        ? "✓ Yükləndi"
                                                        : `Şəkil ${index + 1}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {pendingEditRequestId && (
                                    <small>
                                        Redaktə sorğusu artıq yaradılıb.
                                        Məlumatlar kilidlənib. Şəkil yükləməsi
                                        yarımçıq qalıbsa, yenidən göndərməklə
                                        davam edə bilərsiniz.
                                    </small>
                                )}
                            </div>
                        )}

                        {carFormError && (
                            <p className="listing-error full-width">
                                {carFormError}
                            </p>
                        )}

                        {isEditRequest && imageError && (
                            <p className="listing-error full-width">
                                {imageError}
                            </p>
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
                                    ? "Göndərilir..."
                                    : isEditRequest
                                        ? isEditRequestPending
                                            ? "Şəkil yükləməsini davam etdir"
                                            : "Admin yoxlamasına göndər"
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
                                    Keyfiyyətli şəkillər elanınızın daha çox
                                    diqqət çəkməsinə kömək edir.
                                </p>
                            </div>
                        </div>

                        <div className="upload-stats">
                            <div>
                                <strong>{safeSelectedFiles.length}/10</strong>
                                <span>Seçilmiş şəkillər</span>
                            </div>
                            <div>
                                <strong>{uploadedImageCount}/5</strong>
                                <span>Minimum yüklənmə</span>
                            </div>
                        </div>

                        <label
                            className="upload-zone"
                            htmlFor="car-images"
                        >
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

                        {safeSelectedFiles.length > 0 && (
                            <div className="listing-preview-grid">
                                {safeSelectedFiles.map((file, index) => (
                                    <div
                                        className="listing-preview-item"
                                        key={`${file.name}-${index}`}
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Şəkil ${index + 1}`}
                                        />
                                        <span
                                            className={
                                                index < uploadedImageCount
                                                    ? "uploaded"
                                                    : ""
                                            }
                                        >
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
                                    width: `${Math.min(
                                        (uploadedImageCount / 5) * 100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>

                        <p className="upload-progress-text">
                            {uploadedImageCount >= 5
                                ? "Minimum şəkil sayı tamamlandı."
                                : `Yoxlamaya göndərmək üçün daha ${
                                      5 - uploadedImageCount
                                  } şəkil yükləməlisiniz.`}
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
                                    safeSelectedFiles.length < 5 ||
                                    uploadedImageCount >= safeSelectedFiles.length
                                }
                            >
                                {uploading
                                    ? `Yüklənir... (${uploadedImageCount}/${safeSelectedFiles.length})`
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
                                ? "Yoxlamaya göndərilir..."
                                : uploadedImageCount >= 5
                                    ? "✓ Admin yoxlamasına göndər"
                                    : `Admin yoxlamasına göndər (${uploadedImageCount}/5)`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CarFormModal;
