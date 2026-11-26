
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../data/carData";
import "../../styles/AdminDashboard.css";

function AdminDashboard({
    token,
    navigate,
    selectedCarId,
    onCarsUpdated,
}) {
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

    const [selectedEditRequest, setSelectedEditRequest] = useState(null);
    const [approveEditModal, setApproveEditModal] = useState(null);
    const [editRejectReason, setEditRejectReason] = useState("");
    const [editRejectError, setEditRejectError] = useState("");
    const [editActionLoading, setEditActionLoading] = useState(null);

    // Şəkil görüntüləyicisinin state-ləri
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

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

            const statisticsData = await statisticsResponse.json().catch(() => ({}));
            const pendingData = await pendingResponse.json().catch(() => []);
            const editRequestsData = await editRequestsResponse.json().catch(() => []);

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

            setPendingCars(Array.isArray(pendingData) ? pendingData : []);
            setEditRequests(
                Array.isArray(editRequestsData) ? editRequestsData : []
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

    const selectedCar = pendingCars.find(
        (car) => String(car.id) === String(selectedCarId)
    );

    const selectedCarImages = selectedCar
        ? (
            selectedCar.imageUrls ||
            selectedCar.images?.map((image) =>
                typeof image === "string" ? image : image?.imageUrl
            ) ||
            []
        ).filter(Boolean)
        : [];

    // Şəkil görüntüləyicisini aç
    function openImageViewer(images, index = 0) {
        const validImages = (Array.isArray(images) ? images : [])
            .map((image) =>
                typeof image === "string" ? image : image?.imageUrl
            )
            .filter(Boolean);

        if (validImages.length === 0) return;

        setViewerImages(validImages);
        setViewerIndex(index);
        setIsImageViewerOpen(true);
    }

    // Şəkil görüntüləyicisini bağla
    function closeImageViewer() {
        setIsImageViewerOpen(false);
        setViewerImages([]);
        setViewerIndex(0);
    }

    // Növbəti şəkil
    function showNextImage() {
        setViewerIndex((previous) =>
            (previous + 1) % viewerImages.length
        );
    }

    // Əvvəlki şəkil
    function showPreviousImage() {
        setViewerIndex((previous) =>
            (previous - 1 + viewerImages.length) % viewerImages.length
        );
    }

    // Klaviatura ilə şəkilləri idarə et
    useEffect(() => {
        if (!isImageViewerOpen) return;

        function handleImageViewerKeyDown(event) {
            if (event.key === "Escape") {
                closeImageViewer();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                showNextImage();
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousImage();
            }
        }

        window.addEventListener("keydown", handleImageViewerKeyDown);

        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleImageViewerKeyDown);
            document.body.style.overflow = "";
        };
    }, [isImageViewerOpen, viewerImages.length]);

    function formatDate(value) {
        if (!value) return "Tarix göstərilməyib";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Tarix göstərilməyib";
        }

        return date.toLocaleString("az-AZ");
    }

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

            await Promise.all([
                loadDashboard(),
                onCarsUpdated?.(),
            ]);

            if (selectedCarId) {
                navigate("/admin");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

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

            await Promise.all([
                loadDashboard(),
                onCarsUpdated?.(),
            ]);

            if (selectedCarId) {
                navigate("/admin");
            }
        } catch (err) {
            setRejectError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleApproveEdit() {
        if (!approveEditModal) return;

        const request = approveEditModal;

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

            setApproveEditModal(null);
            setSelectedEditRequest(null);

            await Promise.all([
                loadDashboard(),
                onCarsUpdated?.(),
            ]);
        } catch (err) {
            setError(err.message);
        } finally {
            setEditActionLoading(null);
        }
    }

    async function handleRejectEdit(request) {
        if (!request) return;

        const reason = editRejectReason.trim();

        if (reason.length < 5) {
            setEditRejectError("Səbəb ən azı 5 simvol olmalıdır.");
            return;
        }

        if (reason.length > 500) {
            setEditRejectError("Səbəb maksimum 500 simvol ola bilər.");
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

            await loadDashboard();
        } catch (err) {
            setEditRejectError(err.message);
        } finally {
            setEditActionLoading(null);
        }
    }

    function getComparisonRows(request) {
        return [
            ["Marka", request.oldBrand, request.brand],
            ["Model", request.oldModel, request.model],
            ["Buraxılış ili", request.oldYear, request.year],
            ["Qiymət", formatPrice(request.oldPrice), formatPrice(request.price)],
            ["Yürüş", formatValue(request.oldMileage, " km"), formatValue(request.mileage, " km")],
            ["Mühərrik həcmi", formatValue(request.oldEngineVolume, " L"), formatValue(request.engineVolume, " L")],
            ["At gücü", formatValue(request.oldHorsePower, " HP"), formatValue(request.horsePower, " HP")],
            ["Yanacaq", formatEnum(request.oldFuelType), formatEnum(request.fuelType)],
            ["Sürətlər qutusu", formatEnum(request.oldTransmission), formatEnum(request.transmission)],
            ["Ban növü", formatEnum(request.oldBodyType), formatEnum(request.bodyType)],
            ["Oturacaq sayı", formatValue(request.oldSeatCount), formatValue(request.seatCount)],
            ["Ötürücü", formatEnum(request.oldDrivetrain), formatEnum(request.drivetrain)],
            ["Rəng", request.oldColor, request.color],
            ["Telefon", request.oldContactPhone, request.contactPhone],
            ["Şəhər", request.oldLocation, request.location],
            ["Açıqlama", request.oldDescription, request.description],
        ];
    }

    function renderImageList(images, title) {
        const imageList = Array.isArray(images) ? images : [];

        return (
            <div className="admin-edit-image-column">
                <h4>{title}</h4>

                {imageList.length === 0 ? (
                    <div className="admin-edit-no-image">Şəkil yoxdur</div>
                ) : (
                    <div className="admin-edit-image-grid">
                        {imageList.map((item, index) => {
                            const url =
                                typeof item === "string"
                                    ? item
                                    : item?.imageUrl;

                            if (!url) return null;

                            return (
                                <button
                                    type="button"
                                    key={`${url}-${index}`}
                                    className="admin-edit-image-link"
                                    onClick={() =>
                                        openImageViewer(
                                            imageList.map((image) =>
                                                typeof image === "string"
                                                    ? image
                                                    : image?.imageUrl
                                            ).filter(Boolean),
                                            index
                                        )
                                    }
                                >
                                    <img
                                        src={url}
                                        alt={`${title} ${index + 1}`}
                                        loading="lazy"
                                    />
                                    <span>{index + 1}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <style>{`
                .admin-detail-page {
                    padding: 35px 0 60px;
                }

                .admin-detail-back {
                    margin-bottom: 25px;
                    padding: 11px 18px;
                    border: 1px solid #ddd;
                    border-radius: 7px;
                    background: #fff;
                    cursor: pointer;
                    font-weight: 700;
                }

                .admin-detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 25px;
                }

                .admin-detail-header h1 {
                    margin: 8px 0;
                    font-size: 32px;
                }

                .admin-detail-images {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 15px;
                    margin: 25px 0;
                }

                .admin-detail-images button {
                    height: 210px;
                    display: block;
                    overflow: hidden;
                    padding: 0;
                    border: none;
                    border-radius: 12px;
                    background: #eee;
                    cursor: zoom-in;
                }

                .admin-detail-images img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform .3s ease;
                }

                .admin-detail-images button:hover img {
                    transform: scale(1.05);
                }

                .admin-detail-info {
                    padding: 25px;
                    border: 1px solid #e8e8e8;
                    border-radius: 12px;
                    background: #fff;
                }

                .admin-detail-info h2 {
                    margin-bottom: 22px;
                }

                .admin-detail-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 20px;
                }

                .admin-detail-field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #eee;
                    min-width: 0;
                }

                .admin-detail-field span {
                    color: #888;
                    font-size: 12px;
                }

                .admin-detail-field strong {
                    color: #222;
                    font-size: 15px;
                    overflow-wrap: anywhere;
                }

                .admin-detail-description {
                    margin-top: 28px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }

                .admin-detail-description p {
                    margin-top: 12px;
                    line-height: 1.8;
                    white-space: pre-wrap;
                }

                .admin-detail-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 25px;
                }

                .admin-detail-actions button {
                    min-width: 150px;
                    min-height: 45px;
                    border: none;
                    border-radius: 7px;
                    cursor: pointer;
                    font-weight: 800;
                }

                .admin-detail-actions button:disabled {
                    opacity: .5;
                    cursor: not-allowed;
                }

                .admin-detail-approve {
                    color: #fff;
                    background: #16813a;
                }

                .admin-detail-reject {
                    color: #fff;
                    background: #c51e2e;
                }

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
                    font-size: 27px;
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

                .admin-modal-car span {
                    display: block;
                    color: #888;
                    font-size: 11px;
                }

                .admin-modal-car strong {
                    display: block;
                    margin-top: 6px;
                    color: #202127;
                    font-size: 16px;
                }

                .admin-modal-label {
                    display: block;
                    margin: 22px 0 9px;
                    font-size: 13px;
                    font-weight: 800;
                }

                .admin-modal-textarea {
                    width: 100%;
                    min-height: 125px;
                    padding: 14px;
                    resize: vertical;
                    border: 1px solid #dedee2;
                    border-radius: 8px;
                    outline: none;
                    font: inherit;
                }

                .admin-modal-error {
                    margin-top: 9px;
                    color: #c51e2e;
                    font-size: 12px;
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

                /* TAM EKRAN ŞƏKİL GÖRÜNTÜLƏYİCİSİ */

                .admin-image-viewer {
                    position: fixed;
                    inset: 0;
                    z-index: 100000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 70px 90px;
                    background: rgba(0, 0, 0, .96);
                    animation: imageViewerFadeIn .2s ease;
                }

                @keyframes imageViewerFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .admin-image-viewer-image {
                    display: block;
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    user-select: none;
                    -webkit-user-drag: none;
                    border-radius: 5px;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, .4);
                }

                .admin-image-viewer-close,
                .admin-image-viewer-arrow {
                    position: absolute;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, .2);
                    color: #fff;
                    background: rgba(255, 255, 255, .12);
                    cursor: pointer;
                    transition: background .2s, transform .2s;
                }

                .admin-image-viewer-close:hover,
                .admin-image-viewer-arrow:hover {
                    background: rgba(255, 255, 255, .28);
                    transform: scale(1.06);
                }

                .admin-image-viewer-close {
                    top: 22px;
                    right: 25px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    font-size: 34px;
                    line-height: 1;
                }

                .admin-image-viewer-arrow {
                    top: 50%;
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    font-size: 25px;
                    transform: translateY(-50%);
                }

                .admin-image-viewer-arrow:hover {
                    transform: translateY(-50%) scale(1.06);
                }

                .admin-image-viewer-prev {
                    left: 22px;
                }

                .admin-image-viewer-next {
                    right: 22px;
                }

                .admin-image-viewer-counter {
                    position: absolute;
                    bottom: 22px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 8px 16px;
                    border: 1px solid rgba(255, 255, 255, .15);
                    border-radius: 30px;
                    color: #fff;
                    background: rgba(255, 255, 255, .12);
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                @media (max-width: 700px) {
                    .admin-detail-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .admin-image-viewer {
                        padding: 65px 55px;
                    }

                    .admin-image-viewer-arrow {
                        width: 42px;
                        height: 42px;
                        font-size: 20px;
                    }

                    .admin-image-viewer-prev {
                        left: 8px;
                    }

                    .admin-image-viewer-next {
                        right: 8px;
                    }

                    .admin-image-viewer-close {
                        top: 12px;
                        right: 12px;
                        width: 42px;
                        height: 42px;
                    }
                }

                @media (max-width: 450px) {
                    .admin-detail-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-detail-actions,
                    .admin-modal-actions {
                        flex-direction: column;
                    }

                    .admin-detail-actions button,
                    .admin-modal-actions button {
                        width: 100%;
                    }

                    .admin-image-viewer {
                        padding: 60px 45px;
                    }
                }
            `}</style>

            {selectedCarId ? (
                <main className="admin-dashboard admin-detail-page">
                    <div className="container">
                        <button
                            type="button"
                            className="admin-detail-back"
                            onClick={() => navigate("/admin")}
                        >
                            ← Elanların siyahısına qayıt
                        </button>

                        {loading ? (
                            <div className="admin-empty-state">
                                Elan məlumatları yüklənir...
                            </div>
                        ) : !selectedCar ? (
                            <div className="admin-empty-state">
                                <h3>Elan tapılmadı</h3>
                                <p>
                                    Elan artıq yoxlama siyahısında olmaya bilər.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="admin-detail-header">
                                    <div>
                                        <p className="eyebrow">
                                            TAPAVTO · ELANIN YOXLAMASI
                                        </p>
                                        <h1>
                                            {selectedCar.brand} {selectedCar.model}
                                        </h1>
                                        <p>Elan №{selectedCar.id}</p>
                                    </div>

                                    <span className="admin-status-pending">
                                        Yoxlamada
                                    </span>
                                </div>

                                <div className="admin-detail-images">
                                    {selectedCarImages.length > 0 ? (
                                        selectedCarImages.map((image, index) => (
                                            <button
                                                type="button"
                                                key={`${image}-${index}`}
                                                onClick={() =>
                                                    openImageViewer(
                                                        selectedCarImages,
                                                        index
                                                    )
                                                }
                                                aria-label={`${index + 1}-ci şəkli böyüt`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${selectedCar.brand} ${selectedCar.model} ${index + 1}`}
                                                />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="admin-empty-state">
                                            Elanın şəkli yoxdur.
                                        </div>
                                    )}
                                </div>

                                <section className="admin-detail-info">
                                    <h2>Avtomobil məlumatları</h2>

                                    <div className="admin-detail-grid">
                                        {[
                                            ["Marka", selectedCar.brand],
                                            ["Model", selectedCar.model],
                                            ["Buraxılış ili", selectedCar.year],
                                            ["Qiymət", formatPrice(selectedCar.price)],
                                            ["Yürüş", formatValue(selectedCar.mileage, " km")],
                                            ["Mühərrik həcmi", formatValue(selectedCar.engineVolume, " L")],
                                            ["At gücü", formatValue(selectedCar.horsePower, " HP")],
                                            ["Yanacaq", formatEnum(selectedCar.fuelType)],
                                            ["Sürətlər qutusu", formatEnum(selectedCar.transmission)],
                                            ["Ban növü", formatEnum(selectedCar.bodyType)],
                                            ["Oturacaq sayı", formatValue(selectedCar.seatCount)],
                                            ["Ötürücü", formatEnum(selectedCar.drivetrain)],
                                            ["Rəng", selectedCar.color],
                                            ["Şəhər", selectedCar.location],
                                            ["Satıcı", selectedCar.owner?.firstName || selectedCar.ownerName],
                                            ["Əlaqə telefonu", selectedCar.contactPhone],
                                            ["Elanın tarixi", formatDate(selectedCar.createdAt)],
                                        ].map(([label, value]) => (
                                            <div className="admin-detail-field" key={label}>
                                                <span>{label}</span>
                                                <strong>
                                                    {value === null || value === undefined || value === ""
                                                        ? "—"
                                                        : value}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="admin-detail-description">
                                        <h3>Elanın açıqlaması</h3>
                                        <p>
                                            {selectedCar.description ||
                                                "Açıqlama əlavə edilməyib."}
                                        </p>
                                    </div>
                                </section>

                                <div className="admin-detail-actions">
                                    <button
                                        type="button"
                                        className="admin-detail-approve"
                                        onClick={() => openApproveModal(selectedCar)}
                                        disabled={actionLoading === selectedCar.id}
                                    >
                                        Təsdiqlə
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-detail-reject"
                                        onClick={() => openRejectModal(selectedCar)}
                                        disabled={actionLoading === selectedCar.id}
                                    >
                                        Rədd et
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            ) : (
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
                            <div className="admin-error">{error}</div>
                        )}

                        <section className="admin-statistics">
                            {[
                                ["Ümumi elanlar", statistics.totalCars, ""],
                                ["Yoxlama gözləyən", statistics.pendingCars, "pending"],
                                ["Təsdiqlənmiş", statistics.approvedCars, "approved"],
                                ["Rədd edilmiş", statistics.rejectedCars, "rejected"],
                                ["Qaralamalar", statistics.draftCars, ""],
                                ["İstifadəçilər", statistics.totalUsers, ""],
                            ].map(([label, value, className]) => (
                                <div className={`admin-stat-card ${className}`} key={label}>
                                    <span>{label}</span>
                                    <strong>{value}</strong>
                                </div>
                            ))}
                        </section>

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
                                    <p>Yeni sorğular burada görünəcək.</p>
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
                                                    <strong>{formatPrice(request.oldPrice)}</strong>
                                                </div>

                                                <div className="admin-edit-arrow">→</div>

                                                <div>
                                                    <span>Yeni qiymət</span>
                                                    <strong>{formatPrice(request.price)}</strong>
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
                                    <p>Yeni elan göndərildikdə burada görünəcək.</p>
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
                                            onClick={() => navigate(`/admin/${car.id}`)}
                                            style={{ cursor: "pointer" }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    navigate(`/admin/${car.id}`);
                                                }
                                            }}
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
                                                    <span>İl: {car.year || "—"}</span>
                                                    <span>Yürüş: {car.mileage ?? "—"} km</span>
                                                    <span>Qiymət: {formatPrice(car.price)}</span>
                                                    <span>
                                                        Satıcı: {car.owner?.firstName || car.ownerName || "—"}
                                                    </span>
                                                    <span>
                                                        Telefon: {car.contactPhone || "—"}
                                                    </span>
                                                    <span>Şəhər: {car.location || "—"}</span>
                                                </div>

                                                <p className="admin-car-date">
                                                    Yaradılma tarixi: {formatDate(car.createdAt)}
                                                </p>

                                                {car.description && (
                                                    <p className="admin-car-description">
                                                        {car.description}
                                                    </p>
                                                )}

                                                <p style={{ marginTop: 12, fontWeight: 700 }}>
                                                    Ətraflı məlumatlara bax →
                                                </p>

                                                <div className="admin-car-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-approve-button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openApproveModal(car);
                                                        }}
                                                        disabled={actionLoading === car.id}
                                                    >
                                                        Təsdiqlə
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="admin-reject-button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openRejectModal(car);
                                                        }}
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
            )}

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

                        <div className="admin-modal-car">
                            <span>Təsdiqlənəcək avtomobil</span>
                            <strong>
                                {approveModalCar.brand} {approveModalCar.model}
                                {approveModalCar.year ? ` — ${approveModalCar.year}` : ""}
                            </strong>
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
                                {rejectModalCar.year ? ` — ${rejectModalCar.year}` : ""}
                            </strong>
                        </div>

                        <label className="admin-modal-label" htmlFor="reject-reason">
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

            {selectedEditRequest && (
                <div
                    className="admin-modal-overlay admin-edit-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedEditRequest(null);
                        }
                    }}
                >
                    <div
                        className="admin-edit-modal"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="admin-edit-modal-header">
                            <div>
                                <p className="eyebrow">REDAKTƏ YOXLAMASI</p>
                                <h2>
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
                                onClick={() => setSelectedEditRequest(null)}
                                disabled={editActionLoading !== null}
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-edit-notice">
                            Satıcının təklif etdiyi məlumatları əvvəlki
                            elanla müqayisə edin.
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
                                ([label, oldValue, newValue]) => (
                                    <div
                                        className="admin-edit-comparison-row"
                                        key={label}
                                    >
                                        <div className="admin-edit-field-name">
                                            {label}
                                        </div>
                                        <div className="admin-edit-old-value">
                                            {formatValue(oldValue)}
                                        </div>
                                        <div className="admin-edit-new-value">
                                            {formatValue(newValue)}
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
                                    "Yeni şəkillər"
                                )}
                            </div>
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
                                placeholder="Rədd edilmə səbəbini yazın..."
                                maxLength={500}
                                disabled={editActionLoading !== null}
                            />

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
                                onClick={() => setSelectedEditRequest(null)}
                                disabled={editActionLoading !== null}
                            >
                                Bağla
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm reject"
                                onClick={() => handleRejectEdit(selectedEditRequest)}
                                disabled={editActionLoading !== null}
                            >
                                Redaktəni rədd et
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm approve"
                                onClick={() => setApproveEditModal(selectedEditRequest)}
                                disabled={editActionLoading !== null}
                            >
                                Redaktəni təsdiqlə
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {approveEditModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" role="dialog" aria-modal="true">
                        <div className="admin-modal-top">
                            <div className="admin-modal-icon approve">✓</div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={() => setApproveEditModal(null)}
                                disabled={editActionLoading !== null}
                            >
                                ×
                            </button>
                        </div>

                        <h2>Redaktənin təsdiqlənməsi</h2>

                        <p className="admin-modal-description">
                            Satıcının təqdim etdiyi dəyişiklikləri
                            təsdiqləmək istədiyinizə əminsiniz?
                        </p>

                        <div className="admin-modal-car">
                            <span>Təsdiqlənəcək avtomobil</span>
                            <strong>
                                {approveEditModal.brand} {approveEditModal.model}
                            </strong>
                        </div>

                        <div className="admin-modal-actions">
                            <button
                                type="button"
                                className="admin-modal-cancel"
                                onClick={() => setApproveEditModal(null)}
                                disabled={editActionLoading !== null}
                            >
                                Ləğv et
                            </button>

                            <button
                                type="button"
                                className="admin-modal-confirm approve"
                                onClick={handleApproveEdit}
                                disabled={editActionLoading !== null}
                            >
                                {editActionLoading === approveEditModal.id
                                    ? "Təsdiqlənir..."
                                    : "Redaktəni təsdiqlə"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAM EKRAN ŞƏKİL PƏNCƏRƏSİ */}
            {isImageViewerOpen && viewerImages.length > 0 && (
                <div
                    className="admin-image-viewer"
                    onClick={closeImageViewer}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Şəkil görüntüləyicisi"
                >
                    <button
                        type="button"
                        className="admin-image-viewer-close"
                        onClick={(event) => {
                            event.stopPropagation();
                            closeImageViewer();
                        }}
                        aria-label="Şəkli bağla"
                    >
                        ×
                    </button>

                    {viewerImages.length > 1 && (
                        <button
                            type="button"
                            className="admin-image-viewer-arrow admin-image-viewer-prev"
                            onClick={(event) => {
                                event.stopPropagation();
                                showPreviousImage();
                            }}
                            aria-label="Əvvəlki şəkil"
                        >
                            ❮
                        </button>
                    )}

                    <img
                        className="admin-image-viewer-image"
                        src={viewerImages[viewerIndex]}
                        alt={`Şəkil ${viewerIndex + 1}`}
                        onClick={(event) => event.stopPropagation()}
                    />

                    {viewerImages.length > 1 && (
                        <button
                            type="button"
                            className="admin-image-viewer-arrow admin-image-viewer-next"
                            onClick={(event) => {
                                event.stopPropagation();
                                showNextImage();
                            }}
                            aria-label="Növbəti şəkil"
                        >
                            ❯
                        </button>
                    )}

                    <div className="admin-image-viewer-counter">
                        {viewerIndex + 1} / {viewerImages.length}
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;
