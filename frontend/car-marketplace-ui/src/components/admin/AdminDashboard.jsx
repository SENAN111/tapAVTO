
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../data/carData";
import "../../styles/AdminDashboard.css";

function AdminDashboard({ token, navigate, selectedCarId }) {
    const API_BASE_URL = API_URL.replace(/\/cars\/?$/, "");

    const [statistics, setStatistics] = useState({
        totalCars: 0,
        pendingCars: 0,
        approvedCars: 0,
        rejectedCars: 0,
        draftCars: 0,
        totalUsers: 0,
    });

    const [pendingCars, setPendingCars] = useState([]);
    const [editRequests, setEditRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const [approveModalCar, setApproveModalCar] = useState(null);
    const [rejectModalCar, setRejectModalCar] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");

    // Redaktə sorğularının idarə edilməsi
    const [selectedEditRequest, setSelectedEditRequest] = useState(null);
    const [editRejectReason, setEditRejectReason] = useState("");
    const [editRejectError, setEditRejectError] = useState("");
    const [editActionLoading, setEditActionLoading] = useState(null);

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // Dashboard məlumatlarını yüklə
    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                statisticsResponse,
                pendingResponse,
                editRequestsResponse,
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/statistics`, {
                    headers: authHeaders,
                }),
                fetch(`${API_BASE_URL}/admin/cars/pending`, {
                    headers: authHeaders,
                }),
                fetch(`${API_BASE_URL}/admin/car-edits/pending`, {
                    headers: authHeaders,
                }),
            ]);

            const statisticsData = await statisticsResponse
                .json()
                .catch(() => ({}));

            const pendingData = await pendingResponse
                .json()
                .catch(() => []);

            const editRequestsData = await editRequestsResponse
                .json()
                .catch(() => []);

            if (!statisticsResponse.ok) {
                throw new Error(
                    statisticsData.message ||
                    statisticsData.error ||
                    "Statistik məlumatları yüklənmədi."
                );
            }

            if (!pendingResponse.ok) {
                throw new Error(
                    pendingData.message ||
                    pendingData.error ||
                    "Yoxlama gözləyən elanlar yüklənmədi."
                );
            }

            if (!editRequestsResponse.ok) {
                throw new Error(
                    editRequestsData.message ||
                    editRequestsData.error ||
                    "Redaktə sorğularını yükləmək mümkün olmadı."
                );
            }

            setStatistics((previous) => ({
                ...previous,
                ...statisticsData,
            }));

            setPendingCars(
                Array.isArray(pendingData) ? pendingData : []
            );

            setEditRequests(
                Array.isArray(editRequestsData)
                    ? editRequestsData
                    : []
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // Bildirişdən gələn elana avtomatik keçid
    useEffect(() => {
        if (!selectedCarId || loading) return;

        const selectedElement = document.getElementById(
            `admin-car-${selectedCarId}`
        );

        if (selectedElement) {
            selectedElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [selectedCarId, loading, pendingCars]);

    // Elan təsdiqləmə modalı
    function openApproveModal(car) {
        setApproveModalCar(car);
    }

    function closeApproveModal() {
        if (actionLoading !== null) return;
        setApproveModalCar(null);
    }

    async function handleApprove() {
        if (!approveModalCar) return;

        const car = approveModalCar;

        try {
            setActionLoading(car.id);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/admin/cars/${car.id}/approve`,
                {
                    method: "PATCH",
                    headers: authHeaders,
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Elanı təsdiqləmək mümkün olmadı."
                );
            }

            setApproveModalCar(null);
            alert("Elan uğurla təsdiqləndi.");

            await loadDashboard();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    // Elan rədd etmə modalı
    function openRejectModal(car) {
        setRejectModalCar(car);
        setRejectReason("");
        setRejectError("");
    }

    function closeRejectModal() {
        if (actionLoading !== null) return;

        setRejectModalCar(null);
        setRejectReason("");
        setRejectError("");
    }

    async function handleReject() {
        if (!rejectModalCar) return;

        const trimmedReason = rejectReason.trim();

        if (!trimmedReason) {
            setRejectError(
                "Zəhmət olmasa, rədd edilmə səbəbini qeyd edin."
            );
            return;
        }

        if (trimmedReason.length < 5) {
            setRejectError(
                "Rədd edilmə səbəbi ən azı 5 simvol olmalıdır."
            );
            return;
        }

        const car = rejectModalCar;

        try {
            setActionLoading(car.id);
            setRejectError("");
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/admin/cars/${car.id}/reject?reason=${encodeURIComponent(trimmedReason)}`,
                {
                    method: "PATCH",
                    headers: authHeaders,
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Elanı rədd etmək mümkün olmadı."
                );
            }

            setRejectModalCar(null);
            setRejectReason("");
            setRejectError("");

            alert("Elan rədd edildi.");

            await loadDashboard();
        } catch (err) {
            setRejectError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    // Redaktə sorğusunu təsdiqlə
    async function handleApproveEdit(request) {
        if (!request) return;

        const confirmed = window.confirm(
            `${request.brand} ${request.model} redaktəsini təsdiqləmək istəyirsiniz?`
        );

        if (!confirmed) return;

        try {
            setEditActionLoading(request.id);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/admin/car-edits/${request.id}/approve`,
                {
                    method: "PATCH",
                    headers: authHeaders,
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Redaktə sorğusunu təsdiqləmək mümkün olmadı."
                );
            }

            setSelectedEditRequest(null);

            alert("Elan redaktəsi təsdiqləndi. Satıcıya bildiriş göndərildi.");

            await loadDashboard();
        } catch (err) {
            setError(err.message);
        } finally {
            setEditActionLoading(null);
        }
    }

    // Redaktə sorğusunu rədd et
    async function handleRejectEdit(request) {
        if (!request) return;

        const reason = editRejectReason.trim();

        if (!reason) {
            setEditRejectError(
                "Rədd edilmə səbəbini qeyd edin."
            );
            return;
        }

        if (reason.length < 5) {
            setEditRejectError(
                "Səbəb ən azı 5 simvol olmalıdır."
            );
            return;
        }

        if (reason.length > 500) {
            setEditRejectError(
                "Səbəb maksimum 500 simvol ola bilər."
            );
            return;
        }

        try {
            setEditActionLoading(request.id);
            setEditRejectError("");
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/admin/car-edits/${request.id}/reject`,
                {
                    method: "PATCH",
                    headers: authHeaders,
                    body: JSON.stringify({ reason }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Redaktə sorğusunu rədd etmək mümkün olmadı."
                );
            }

            setSelectedEditRequest(null);
            setEditRejectReason("");
            setEditRejectError("");

            alert(
                "Redaktə sorğusu rədd edildi. Satıcıya səbəb barədə bildiriş göndərildi."
            );

            await loadDashboard();
        } catch (err) {
            setEditRejectError(err.message);
        } finally {
            setEditActionLoading(null);
        }
    }

    function closeEditRequest() {
        if (editActionLoading !== null) return;

        setSelectedEditRequest(null);
        setEditRejectReason("");
        setEditRejectError("");
    }

    // Tarix formatı
    function formatDate(value) {
        if (!value) return "Tarix göstərilməyib";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Tarix göstərilməyib";
        }

        return date.toLocaleString("az-AZ");
    }

    // Qiymət formatı
    function formatPrice(value) {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return `${Number(value).toLocaleString("az-AZ")} AZN`;
    }

    function formatValue(value, suffix = "") {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return `${value}${suffix}`;
    }

    function formatEnum(value) {
        if (!value) return "—";

        return String(value)
            .replaceAll("_", " ")
            .toLocaleLowerCase("az-AZ")
            .replace(/^./, (character) =>
                character.toLocaleUpperCase("az-AZ")
            );
    }

    // Müqayisə üçün məlumatlar
    function getComparisonRows(request) {
        return [
            {
                label: "Marka",
                oldValue: request.oldBrand,
                newValue: request.brand,
            },
            {
                label: "Model",
                oldValue: request.oldModel,
                newValue: request.model,
            },
            {
                label: "Buraxılış ili",
                oldValue: request.oldYear,
                newValue: request.year,
            },
            {
                label: "Qiymət",
                oldValue: formatPrice(request.oldPrice),
                newValue: formatPrice(request.price),
            },
            {
                label: "Yürüş",
                oldValue: formatValue(request.oldMileage, " km"),
                newValue: formatValue(request.mileage, " km"),
            },
            {
                label: "Mühərrik həcmi",
                oldValue: formatValue(request.oldEngineVolume, " L"),
                newValue: formatValue(request.engineVolume, " L"),
            },
            {
                label: "At gücü",
                oldValue: formatValue(request.oldHorsePower, " HP"),
                newValue: formatValue(request.horsePower, " HP"),
            },
            {
                label: "Yanacaq",
                oldValue: formatEnum(request.oldFuelType),
                newValue: formatEnum(request.fuelType),
            },
            {
                label: "Sürətlər qutusu",
                oldValue: formatEnum(request.oldTransmission),
                newValue: formatEnum(request.transmission),
            },
            {
                label: "Ban növü",
                oldValue: formatEnum(request.oldBodyType),
                newValue: formatEnum(request.bodyType),
            },
            {
                label: "Oturacaq sayı",
                oldValue: formatEnum(request.oldSeatCount),
                newValue: formatEnum(request.seatCount),
            },
            {
                label: "Ötürücü",
                oldValue: formatEnum(request.oldDrivetrain),
                newValue: formatEnum(request.drivetrain),
            },
            {
                label: "Rəng",
                oldValue: request.oldColor,
                newValue: request.color,
            },
            {
                label: "Telefon",
                oldValue: request.oldContactPhone,
                newValue: request.contactPhone,
            },
            {
                label: "Şəhər",
                oldValue: request.oldLocation,
                newValue: request.location,
            },
            {
                label: "Açıqlama",
                oldValue: request.oldDescription,
                newValue: request.description,
            },
        ];
    }

    function renderImageList(images, title) {
        const imageList = Array.isArray(images) ? images : [];

        return (
            <div className="admin-edit-image-column">
                <h4>{title}</h4>

                {imageList.length === 0 ? (
                    <div className="admin-edit-no-image">
                        Şəkil yoxdur
                    </div>
                ) : (
                    <div className="admin-edit-image-grid">
                        {imageList.map((url, index) => (
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                key={`${url}-${index}`}
                                className="admin-edit-image-link"
                            >
                                <img
                                    src={url}
                                    alt={`${title} ${index + 1}`}
                                    loading="lazy"
                                />
                                <span>{index + 1}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <style>{`
                .admin-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(12, 15, 22, .72);
                    backdrop-filter: blur(7px);
                    animation: adminOverlayIn .25s ease;
                }

                .admin-modal {
                    width: 100%;
                    max-width: 490px;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 30px;
                    border-radius: 14px;
                    background: #fff;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, .25);
                    animation: adminModalIn .3s ease;
                }

                .admin-modal-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }

                .admin-modal-icon {
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 13px;
                    font-size: 27px;
                    font-weight: 900;
                }

                .admin-modal-icon.approve {
                    background: #e3f7e9;
                    color: #16813a;
                }

                .admin-modal-icon.reject {
                    background: #fff0f1;
                    color: #d32132;
                }

                .admin-modal-close {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    border-radius: 8px;
                    background: #f3f4f6;
                    color: #555;
                    font-size: 21px;
                    cursor: pointer;
                }

                .admin-modal h2 {
                    margin-top: 20px;
                    color: #17191e;
                    font-family: 'Barlow Condensed', sans-serif;
                    font-size: 30px;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .admin-modal-description {
                    margin-top: 8px;
                    color: #777;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .admin-modal-car {
                    margin-top: 20px;
                    padding: 15px;
                    border: 1px solid #eee;
                    border-radius: 9px;
                    background: #f8f8f9;
                }

                .admin-modal-car.approve {
                    border-color: #e7eee9;
                    background: #f5fbf6;
                }

                .admin-modal-car span {
                    display: block;
                    color: #888;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .admin-modal-car strong {
                    display: block;
                    margin-top: 6px;
                    color: #202127;
                    font-size: 16px;
                }

                .admin-modal-info {
                    margin-top: 15px;
                    padding: 12px 14px;
                    border-radius: 7px;
                    background: #edf8f0;
                    color: #26713d;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .admin-modal-label {
                    display: block;
                    margin-top: 22px;
                    margin-bottom: 9px;
                    color: #25262b;
                    font-size: 13px;
                    font-weight: 800;
                }

                .admin-modal-textarea {
                    display: block;
                    width: 100%;
                    min-height: 125px;
                    padding: 14px;
                    resize: vertical;
                    border: 1px solid #dedee2;
                    border-radius: 8px;
                    outline: none;
                    background: #fff;
                    color: #222;
                    font-family: inherit;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .admin-modal-textarea:focus {
                    border-color: #d32132;
                    box-shadow: 0 0 0 3px rgba(211, 33, 50, .09);
                }

                .admin-modal-error {
                    margin-top: 9px;
                    color: #c51e2e;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .admin-modal-hint {
                    margin-top: 8px;
                    color: #999;
                    font-size: 11px;
                }

                .admin-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 25px;
                }

                .admin-modal-actions button {
                    min-height: 43px;
                    padding: 0 18px;
                    border-radius: 7px;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .admin-modal-cancel {
                    border: 1px solid #dedee2;
                    background: #fff;
                    color: #555;
                }

                .admin-modal-confirm.approve {
                    border: 1px solid #16813a;
                    background: #16813a;
                    color: #fff;
                }

                .admin-modal-confirm.reject {
                    border: 1px solid #c51e2e;
                    background: #c51e2e;
                    color: #fff;
                }

                .admin-modal-actions button:disabled {
                    opacity: .55;
                    cursor: not-allowed;
                }

                @keyframes adminOverlayIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes adminModalIn {
                    from {
                        opacity: 0;
                        transform: translateY(15px) scale(.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @media (max-width: 520px) {
                    .admin-modal {
                        padding: 22px;
                    }

                    .admin-modal-actions {
                        flex-direction: column-reverse;
                    }

                    .admin-modal-actions button {
                        width: 100%;
                    }
                }
            `}</style>

            <main className="admin-dashboard">
                <div className="container">

                    <div className="admin-dashboard-header">
                        <div>
                            <p className="eyebrow">TAPAVTO İDARƏETMƏ</p>
                            <h1>Admin paneli</h1>
                            <p>
                                Elanları yoxlayın, redaktələri nəzərdən keçirin,
                                təsdiqləyin və ya rədd edin.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="admin-refresh-button"
                            onClick={loadDashboard}
                            disabled={loading}
                        >
                            {loading ? "Yüklənir..." : "Yenilə"}
                        </button>
                    </div>

                    {error && (
                        <div className="admin-error">
                            {error}
                        </div>
                    )}

                    {/* STATISTICS */}
                    <section className="admin-statistics">
                        <div className="admin-stat-card">
                            <span>Ümumi elanlar</span>
                            <strong>{statistics.totalCars}</strong>
                        </div>

                        <div className="admin-stat-card pending">
                            <span>Yoxlama gözləyən</span>
                            <strong>{statistics.pendingCars}</strong>
                        </div>

                        <div className="admin-stat-card approved">
                            <span>Təsdiqlənmiş</span>
                            <strong>{statistics.approvedCars}</strong>
                        </div>

                        <div className="admin-stat-card rejected">
                            <span>Rədd edilmiş</span>
                            <strong>{statistics.rejectedCars}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>Qaralamalar</span>
                            <strong>{statistics.draftCars}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>İstifadəçilər</span>
                            <strong>{statistics.totalUsers}</strong>
                        </div>
                    </section>

                    {/* EDIT REQUESTS */}
                    <section className="admin-edit-section">
                        <div className="admin-section-header">
                            <div>
                                <p className="eyebrow">ELANLARA NƏZARƏT</p>
                                <h2>Elan redaktə sorğuları</h2>
                                <p className="admin-edit-subtitle">
                                    Satıcıların mövcud elanlarında etmək
                                    istədikləri dəyişiklikləri yoxlayın.
                                </p>
                            </div>

                            <span className="admin-edit-count">
                                {editRequests.length} sorğu
                            </span>
                        </div>

                        {loading ? (
                            <div className="admin-empty-state">
                                Redaktə sorğuları yüklənir...
                            </div>
                        ) : editRequests.length === 0 ? (
                            <div className="admin-empty-state">
                                <h3>Gözləyən redaktə sorğusu yoxdur</h3>
                                <p>
                                    Satıcı redaktə sorğusu göndərdikdə
                                    burada görünəcək.
                                </p>
                            </div>
                        ) : (
                            <div className="admin-edit-list">
                                {editRequests.map((request) => (
                                    <article
                                        className="admin-edit-card"
                                        key={request.id}
                                    >
                                        <div className="admin-edit-card-header">
                                            <div>
                                                <span className="admin-edit-request-label">
                                                    REDAKTƏ SORĞUSU #{request.id}
                                                </span>

                                                <h3>
                                                    {request.oldBrand || request.brand}{" "}
                                                    {request.oldModel || request.model}
                                                </h3>

                                                <p>
                                                    Satıcı: {request.requestedBy || "—"}
                                                </p>
                                                <p>
                                                    Sorğu tarixi: {formatDate(request.createdAt)}
                                                </p>
                                            </div>

                                            <span className="admin-edit-pending-badge">
                                                Gözləyir
                                            </span>
                                        </div>

                                        <div className="admin-edit-summary">
                                            <div>
                                                <span>Əvvəlki qiymət</span>
                                                <strong>
                                                    {formatPrice(request.oldPrice)}
                                                </strong>
                                            </div>

                                            <div className="admin-edit-arrow">
                                                →
                                            </div>

                                            <div>
                                                <span>Yeni qiymət</span>
                                                <strong>
                                                    {formatPrice(request.price)}
                                                </strong>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="admin-edit-review-button"
                                            onClick={() => {
                                                setSelectedEditRequest(request);
                                                setEditRejectReason("");
                                                setEditRejectError("");
                                            }}
                                        >
                                            Dəyişiklikləri müqayisə et
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* PENDING CAR LIST */}
                    <section className="admin-pending-section">
                        <div className="admin-section-header">
                            <div>
                                <p className="eyebrow">MODERASİYA</p>
                                <h2>Yoxlama gözləyən elanlar</h2>
                            </div>

                            <span className="admin-pending-count">
                                {pendingCars.length} elan
                            </span>
                        </div>

                        {loading ? (
                            <div className="admin-empty-state">
                                Məlumatlar yüklənir...
                            </div>
                        ) : pendingCars.length === 0 ? (
                            <div className="admin-empty-state">
                                <h3>Yoxlama gözləyən elan yoxdur</h3>
                                <p>
                                    Yeni elan göndərildikdə burada görünəcək.
                                </p>
                            </div>
                        ) : (
                            <div className="admin-pending-list">
                                {pendingCars.map((car) => (
                                    <article
                                        id={`admin-car-${car.id}`}
                                        className={`admin-car-card ${
                                            String(car.id) === String(selectedCarId)
                                                ? "admin-car-card-highlighted"
                                                : ""
                                        }`}
                                        key={car.id}
                                    >
                                        <div className="admin-car-information">
                                            <div className="admin-car-heading">
                                                <h3>
                                                    {car.brand} {car.model}
                                                </h3>

                                                <span className="admin-status-pending">
                                                    Yoxlamada
                                                </span>
                                            </div>

                                            <div className="admin-car-details">
                                                <span>
                                                    İl: {car.year || "—"}
                                                </span>

                                                <span>
                                                    Yürüş: {car.mileage ?? "—"} km
                                                </span>

                                                <span>
                                                    Qiymət: {formatPrice(car.price)}
                                                </span>

                                                <span>
                                                    Satıcı: {car.owner?.firstName || car.ownerName || "—"}
                                                </span>

                                                <span>
                                                    Telefon: {car.contactPhone || "—"}
                                                </span>

                                                <span>
                                                    Şəhər: {car.location || "—"}
                                                </span>
                                            </div>

                                            <p className="admin-car-date">
                                                Yaradılma tarixi: {formatDate(car.createdAt)}
                                            </p>

                                            {car.description && (
                                                <p className="admin-car-description">
                                                    {car.description}
                                                </p>
                                            )}

                                            <div className="admin-car-actions">
                                                <button
                                                    type="button"
                                                    className="admin-approve-button"
                                                    onClick={() => openApproveModal(car)}
                                                    disabled={actionLoading === car.id}
                                                >
                                                    Təsdiqlə
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-reject-button"
                                                    onClick={() => openRejectModal(car)}
                                                    disabled={actionLoading === car.id}
                                                >
                                                    Rədd et
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="admin-dashboard-footer">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                        >
                            Sayta qayıt
                        </button>
                    </div>
                </div>
            </main>

            {/* CAR APPROVE MODAL */}
            {approveModalCar && (
                <div
                    className="admin-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeApproveModal();
                        }
                    }}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="approve-modal-title"
                    >
                        <div className="admin-modal-top">
                            <div className="admin-modal-icon approve">✓</div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeApproveModal}
                                disabled={actionLoading !== null}
                                aria-label="Bağla"
                            >
                                ×
                            </button>
                        </div>

                        <h2 id="approve-modal-title">
                            Elanın təsdiqlənməsi
                        </h2>

                        <p className="admin-modal-description">
                            Bu elanı təsdiqləməklə onun yayımlanmasına
                            icazə vermiş olacaqsınız.
                        </p>

                        <div className="admin-modal-car approve">
                            <span>Təsdiqlənəcək avtomobil</span>
                            <strong>
                                {approveModalCar.brand} {approveModalCar.model}
                                {approveModalCar.year
                                    ? ` — ${approveModalCar.year}`
                                    : ""}
                            </strong>
                        </div>

                        <div className="admin-modal-info">
                            ✓ Təsdiqdən sonra elan aktiv elanlar siyahısına
                            əlavə olunacaq.
                        </div>

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-modal-cancel"
                                onClick={closeApproveModal}
                                disabled={actionLoading !== null}
                            >
                                Ləğv et
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm approve"
                                onClick={handleApprove}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading === approveModalCar.id
                                    ? "Təsdiqlənir..."
                                    : "Elanı təsdiqlə"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CAR REJECT MODAL */}
            {rejectModalCar && (
                <div
                    className="admin-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeRejectModal();
                        }
                    }}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reject-modal-title"
                    >
                        <div className="admin-modal-top">
                            <div className="admin-modal-icon reject">!</div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeRejectModal}
                                disabled={actionLoading !== null}
                                aria-label="Bağla"
                            >
                                ×
                            </button>
                        </div>

                        <h2 id="reject-modal-title">
                            Elanın rədd edilməsi
                        </h2>

                        <p className="admin-modal-description">
                            Elanı rədd etməzdən əvvəl satıcıya göndəriləcək
                            səbəbi qeyd edin.
                        </p>

                        <div className="admin-modal-car">
                            <span>Rədd ediləcək elan</span>
                            <strong>
                                {rejectModalCar.brand} {rejectModalCar.model}
                                {rejectModalCar.year
                                    ? ` — ${rejectModalCar.year}`
                                    : ""}
                            </strong>
                        </div>

                        <label
                            className="admin-modal-label"
                            htmlFor="reject-reason"
                        >
                            Rədd edilmə səbəbi *
                        </label>

                        <textarea
                            id="reject-reason"
                            className="admin-modal-textarea"
                            value={rejectReason}
                            onChange={(event) => {
                                setRejectReason(event.target.value);
                                setRejectError("");
                            }}
                            placeholder="Rədd edilmə səbəbini yazın..."
                            maxLength={1000}
                            disabled={actionLoading !== null}
                        />

                        <div className="admin-modal-hint">
                            {rejectReason.length}/1000 simvol
                        </div>

                        {rejectError && (
                            <div className="admin-modal-error">
                                {rejectError}
                            </div>
                        )}

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-modal-cancel"
                                onClick={closeRejectModal}
                                disabled={actionLoading !== null}
                            >
                                Ləğv et
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm reject"
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading === rejectModalCar.id
                                    ? "Göndərilir..."
                                    : "Elanı rədd et"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT REQUEST COMPARISON MODAL */}
            {selectedEditRequest && (
                <div
                    className="admin-modal-overlay admin-edit-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditRequest();
                        }
                    }}
                >
                    <div
                        className="admin-edit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-request-title"
                    >
                        <div className="admin-edit-modal-header">
                            <div>
                                <p className="eyebrow">REDAKTƏ YOXLAMASI</p>
                                <h2 id="edit-request-title">
                                    {selectedEditRequest.brand}{" "}
                                    {selectedEditRequest.model}
                                </h2>
                                <p>
                                    Sorğu #{selectedEditRequest.id} ·{" "}
                                    {selectedEditRequest.requestedBy || "Satıcı"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeEditRequest}
                                disabled={editActionLoading !== null}
                                aria-label="Bağla"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-edit-notice">
                            Satıcının təklif etdiyi məlumatları əvvəlki
                            təsdiqlənmiş elanla müqayisə edin. Təsdiq
                            edilməyənə qədər mövcud elan dəyişməz qalır.
                        </div>

                        <div className="admin-edit-comparison-heading">
                            <h3>Məlumatların müqayisəsi</h3>
                            <div>
                                <span>Əvvəlki məlumat</span>
                                <span>Yeni təklif</span>
                            </div>
                        </div>

                        <div className="admin-edit-comparison">
                            {getComparisonRows(selectedEditRequest).map(
                                (row) => (
                                    <div
                                        className="admin-edit-comparison-row"
                                        key={row.label}
                                    >
                                        <div className="admin-edit-field-name">
                                            {row.label}
                                        </div>

                                        <div className="admin-edit-old-value">
                                            {formatValue(row.oldValue)}
                                        </div>

                                        <div className="admin-edit-new-value">
                                            {formatValue(row.newValue)}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="admin-edit-images-section">
                            <h3>Şəkillərin müqayisəsi</h3>

                            <div className="admin-edit-images-columns">
                                {renderImageList(
                                    selectedEditRequest.oldImageUrls,
                                    "Əvvəlki şəkillər"
                                )}

                                {renderImageList(
                                    selectedEditRequest.imageUrls,
                                    "Yeni əlavə edilmiş şəkillər"
                                )}
                            </div>

                            <p className="admin-edit-image-note">
                                Qeyd: Yeni şəkillər təsdiq zamanı mövcud
                                elanın şəkillərinə əlavə olunur.
                            </p>
                        </div>

                        <div className="admin-edit-reject-area">
                            <label htmlFor="edit-reject-reason">
                                Rədd edilmə səbəbi
                            </label>

                            <textarea
                                id="edit-reject-reason"
                                value={editRejectReason}
                                onChange={(event) => {
                                    setEditRejectReason(event.target.value);
                                    setEditRejectError("");
                                }}
                                placeholder="Rədd etmək istəyirsinizsə, səbəbi burada qeyd edin..."
                                maxLength={500}
                                disabled={editActionLoading !== null}
                            />

                            <div className="admin-modal-hint">
                                {editRejectReason.length}/500 simvol
                            </div>

                            {editRejectError && (
                                <div className="admin-modal-error">
                                    {editRejectError}
                                </div>
                            )}
                        </div>

                        <div className="admin-edit-modal-actions">
                            <button
                                type="button"
                                className="admin-modal-cancel"
                                onClick={closeEditRequest}
                                disabled={editActionLoading !== null}
                            >
                                Bağla
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm reject"
                                onClick={() =>
                                    handleRejectEdit(selectedEditRequest)
                                }
                                disabled={editActionLoading !== null}
                            >
                                {editActionLoading === selectedEditRequest.id
                                    ? "Gözləyin..."
                                    : "Redaktəni rədd et"}
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm approve"
                                onClick={() =>
                                    handleApproveEdit(selectedEditRequest)
                                }
                                disabled={editActionLoading !== null}
                            >
                                {editActionLoading === selectedEditRequest.id
                                    ? "Gözləyin..."
                                    : "Redaktəni təsdiqlə"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;
