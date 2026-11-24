
import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import CarList from "./components/home/CarList";
import CarDetails from "./components/cars/CarDetails";
import ImageLightbox from "./components/cars/ImageLightbox";
import MyCars from "./components/cars/MyCars";
import CarFormModal from "./components/modals/CarFormModal";
import AuthModal from "./components/modals/AuthModal";
import Favorites from "./components/cars/Favorites";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";

import useCars from "./hooks/useCars";
import useAuth from "./hooks/useAuth";
import useCarActions from "./hooks/useCarActions";
import useCarForm from "./hooks/useCarForm";
import useFavorites from "./hooks/useFavorites";

import {
    carColors,
    bodyTypes,
    phonePrefixes,
} from "./data/carData";

import { getCategory } from "./utils/carUtils";

function getUserRoles(token) {
    if (!token) return [];

    try {
        const payload = token.split(".")[1];

        if (!payload) return [];

        const normalizedPayload = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = JSON.parse(atob(normalizedPayload));

        const roles =
            decoded.roles ||
            decoded.authorities ||
            decoded.authority ||
            [];

        if (Array.isArray(roles)) {
            return roles.map((role) =>
                typeof role === "string"
                    ? role
                    : role.authority || role.name || ""
            );
        }

        if (typeof roles === "string") {
            return [roles];
        }

        return [];
    } catch (error) {
        console.error("JWT token oxunmadı:", error);
        return [];
    }
}

function App() {
    const {
        token,
        authMode,
        setAuthMode,
        authError,
        setAuthError,
        authLoading,
        authForm,
        handleAuthChange,
        handleAuthSubmit,
        logout: authLogout,
        openAuth,
    } = useAuth();

    const {
        favoriteIds,
        toggleFavorite,
        isFavorite,
    } = useFavorites(token);

    const {
        cars,
        setCars,
        myCars,
        setMyCars,
        carImages,
        setCarImages,
        loading,
        error,
        loadCars,
        loadMyCars,
    } = useCars(token);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    const [currentPath, setCurrentPath] = useState(
        window.location.pathname
    );

    const [activeImage, setActiveImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    const [carFormLoading, setCarFormLoading] = useState(false);

    const [draftCarId, setDraftCarId] = useState(null);
    const [pendingEditRequestId, setPendingEditRequestId] = useState(null);
    const [uploadedEditImageCount, setUploadedEditImageCount] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedImageCount, setUploadedImageCount] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [imageError, setImageError] = useState("");

    const {
        showCarForm,
        carForm,
        editingCarId,
        editingCarStatus,

        brands,
        carModels,
        modelsLoading,

        brandChoice,
        modelChoice,
        colorChoice,
        phonePrefix,
        phoneNumber,
        carFormError,
        setCarFormError,
        resetCarForm: resetCarFormFields,
        openCarForm: openCarFormFromHook,
        closeCarForm: closeCarFormFromHook,
        handleBrandChange,
        handleModelChange,
        handleCarChange,
        handleColorChange,
        handlePhonePrefixChange,
        handlePhoneNumberChange,
        openEditForm: openEditFormFromHook,
    } = useCarForm({
        token,
        setAuthError,
        setAuthMode,
    });

    const userRoles = getUserRoles(token);

    const isAdmin = userRoles.some((role) =>
        ["ROLE_ADMIN", "ADMIN"].includes(role)
    );

    // Admin səhifəsinin yoxlanılması
    const isAdminPage =
        currentPath === "/admin" ||
        currentPath.startsWith("/admin/");

    // Bildirişdən gələn avtomobil ID-si
    const adminCarMatch = currentPath.match(
        /^\/admin\/(\d+)\/?$/
    );

    const selectedAdminCarId = adminCarMatch
        ? adminCarMatch[1]
        : null;

    // Avtomobil detalları səhifəsinin yoxlanılması
    const carPageMatch = currentPath.match(
        /^\/cars\/(\d+)\/?$/
    );

    const isMyCarsPage = currentPath === "/my-cars";
    const isFavoritesPage = currentPath === "/favorites";

    const selectedCar = carPageMatch
        ? cars.find(
              (car) => String(car.id) === carPageMatch[1]
          ) ||
          myCars.find(
              (car) => String(car.id) === carPageMatch[1]
          )
        : null;

    const isCarPage = Boolean(carPageMatch);

    const selectedImages = selectedCar
        ? carImages[selectedCar.id] || []
        : [];

    // Səhifələr arasında keçid
    function navigate(path) {
        window.history.pushState({}, "", path);
        setCurrentPath(path);
        setActiveImage(0);
        setShowLightbox(false);
        window.scrollTo(0, 0);
    }

    // Elan formasını sıfırla
    function resetCarForm() {
        resetCarFormFields();
        setDraftCarId(null);
        setSelectedFiles([]);
        setUploadedImageCount(0);
        setImageError("");
        setCarFormLoading(false);
        setPendingEditRequestId(null);
        setUploadedEditImageCount(0);
    }

    function openCarForm() {
        if (!token) {
            openCarFormFromHook();
            return;
        }

        resetCarForm();
        openCarFormFromHook();
    }

    function closeCarForm() {
        closeCarFormFromHook();
        setDraftCarId(null);
        setSelectedFiles([]);
        setUploadedImageCount(0);
        setImageError("");
        setCarFormLoading(false);
    }

    function openEditForm(car) {
        openEditFormFromHook(car);

        setDraftCarId(null);
        setSelectedFiles([]);
        setUploadedImageCount(0);
        setPendingEditRequestId(null);
        setUploadedEditImageCount(0);
        setImageError("");
        setCarFormError("");
        setCarFormLoading(false);
    }

    // Brauzerin geri düyməsi
    useEffect(() => {
        function handlePopState() {
            setCurrentPath(window.location.pathname);
            setActiveImage(0);
            setShowLightbox(false);
            window.scrollTo(0, 0);
        }

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // Admin daxil olduqda panelə yönləndir
    useEffect(() => {
        if (token && isAdmin && !isAdminPage) {
            navigate("/admin");
        }
    }, [token]);

    // Admin olmayan istifadəçinin admin səhifəsinə girişini bağla
    useEffect(() => {
        if (isAdminPage && (!token || !isAdmin)) {
            navigate("/");
        }
    }, [currentPath, token, isAdmin]);

    // Şəkil böyüdülmüş pəncərəsinin idarə edilməsi
    useEffect(() => {
        if (!showLightbox) return;

        function handleLightboxKeyDown(event) {
            if (event.key === "Escape") {
                setShowLightbox(false);
            }

            if (
                event.key === "ArrowRight" &&
                selectedImages.length > 1
            ) {
                setActiveImage(
                    (current) =>
                        (current + 1) % selectedImages.length
                );
            }

            if (
                event.key === "ArrowLeft" &&
                selectedImages.length > 1
            ) {
                setActiveImage(
                    (current) =>
                        (current - 1 + selectedImages.length) %
                        selectedImages.length
                );
            }
        }

        document.addEventListener(
            "keydown",
            handleLightboxKeyDown
        );

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleLightboxKeyDown
            );

            document.body.style.overflow = "";
        };
    }, [showLightbox, selectedImages.length]);

    // Avtomobillərin axtarışı və filtrasiyası
    const filteredCars = cars.filter((car) => {
        const text =
            `${car.brand || ""} ${car.model || ""} ${car.year || ""}`
                .toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());

        const matchesCategory =
            category === "all" || getCategory(car) === category;

        return matchesSearch && matchesCategory;
    });

    function openCarDetails(car) {
        navigate(`/cars/${car.id}`);
    }

    function closeCarDetails() {
        navigate("/");
    }

    function goHome() {
        navigate("/");
    }

    function goMyCars() {
        navigate("/my-cars");
        loadMyCars(token);
    }

    function nextImage() {
        if (selectedImages.length <= 1) return;

        setActiveImage(
            (current) =>
                (current + 1) % selectedImages.length
        );
    }

    function previousImage() {
        if (selectedImages.length <= 1) return;

        setActiveImage(
            (current) =>
                (current - 1 + selectedImages.length) %
                selectedImages.length
        );
    }

    function logout() {
        authLogout();
        setMyCars([]);
        setShowLightbox(false);
        closeCarForm();
        navigate("/");
    }

    const {
        handleCarSubmit,
        handleDeleteCar,
        handleFilesChange,
        handleImageUpload,
        handlePublishCar,
    } = useCarActions({
        token,
        carForm,
        phonePrefix,
        phoneNumber,
        editingCarId,
        editingCarStatus,
        pendingEditRequestId,
        uploadedEditImageCount,
        draftCarId,
        selectedFiles,
        uploadedImageCount,
        currentPath,

        setCarFormLoading,
        setCarFormError,
        setDraftCarId,
        setImageError,
        setSelectedFiles,
        setUploadedImageCount,
        setUploading,
        setPublishing,
        setMyCars,
        setCars,
        setCarImages,

        closeCarForm,
        loadMyCars,
        loadCars,
        navigate,
    });

    return (
        <div className="app">

            <Header
                token={token}
                goHome={goHome}
                goMyCars={goMyCars}
                goFavorites={() => navigate("/favorites")}
                openCarForm={openCarForm}
                logout={logout}
                setAuthError={setAuthError}
                setAuthMode={setAuthMode}
                openAuth={openAuth}
                navigate={navigate}
            />

            {isAdminPage && isAdmin ? (
                <AdminDashboard
                    token={token}
                    navigate={navigate}
                    selectedCarId={selectedAdminCarId}
                />
            ) : (
                <>
                    {isMyCarsPage ? (
                        <MyCars
                            goHome={goHome}
                            error={error}
                            myCars={myCars}
                            openCarForm={openCarForm}
                            carImages={carImages}
                            openEditForm={openEditForm}
                            openCarDetails={openCarDetails}
                            handleDeleteCar={handleDeleteCar}
                        />
                    ) : isFavoritesPage ? (
                        <Favorites
                            favoriteIds={favoriteIds}
                            toggleFavorite={toggleFavorite}
                            openCarDetails={openCarDetails}
                        />
                    ) : !isCarPage ? (
                        <main>
                            <Hero
                                onBrowseCars={() =>
                                    document
                                        .getElementById("cars")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                }
                            />

                            <CarList
                                search={search}
                                setSearch={setSearch}
                                category={category}
                                setCategory={setCategory}
                                loading={loading}
                                error={error}
                                loadCars={loadCars}
                                filteredCars={filteredCars}
                                carImages={carImages}
                                openCarDetails={openCarDetails}
                                favoriteIds={favoriteIds}
                                toggleFavorite={toggleFavorite}
                                isFavorite={isFavorite}
                            />

                            <section
                                className="about-section"
                                id="about"
                            >
                                <div className="container">
                                    <p className="eyebrow">
                                        BİZ KİMİK?
                                    </p>

                                    <h2>tapAVTO haqqında</h2>

                                    <p>
                                        tapAVTO avtomobil alqı-satqısını
                                        daha rahat və əlçatan etmək üçün
                                        yaradılmış platformadır.
                                    </p>
                                </div>
                            </section>
                        </main>
                    ) : (
                        <CarDetails
                            selectedCar={selectedCar}
                            selectedImages={selectedImages}
                            loading={loading}
                            closeCarDetails={closeCarDetails}
                            activeImage={activeImage}
                            setActiveImage={setActiveImage}
                            setShowLightbox={setShowLightbox}
                            previousImage={previousImage}
                            nextImage={nextImage}
                            favoriteIds={favoriteIds}
                            toggleFavorite={toggleFavorite}
                            isFavorite={isFavorite}
                        />
                    )}

                    <Footer />

                    {showLightbox && (
                        <ImageLightbox
                            selectedImages={selectedImages}
                            activeImage={activeImage}
                            selectedCar={selectedCar}
                            setShowLightbox={setShowLightbox}
                            previousImage={previousImage}
                            nextImage={nextImage}
                        />
                    )}

                    <CarFormModal
                        showCarForm={showCarForm}
                        closeCarForm={closeCarForm}
                        editingCarId={editingCarId}
                        editingCarStatus={editingCarStatus}
                        pendingEditRequestId={pendingEditRequestId}
                        uploadedEditImageCount={uploadedEditImageCount}
                        draftCarId={draftCarId}
                        setDraftCarId={setDraftCarId}
                        brands={brands}
                        carModels={carModels}
                        modelsLoading={modelsLoading}
                        carColors={carColors}
                        brandChoice={brandChoice}
                        handleBrandChange={handleBrandChange}
                        modelChoice={modelChoice}
                        handleModelChange={handleModelChange}
                        carForm={carForm}
                        handleCarChange={handleCarChange}
                        bodyTypes={bodyTypes}
                        colorChoice={colorChoice}
                        handleColorChange={handleColorChange}
                        phonePrefix={phonePrefix}
                        handlePhonePrefixChange={handlePhonePrefixChange}
                        phonePrefixes={phonePrefixes}
                        phoneNumber={phoneNumber}
                        handlePhoneNumberChange={handlePhoneNumberChange}
                        carFormError={carFormError}
                        carFormLoading={carFormLoading}
                        handleCarSubmit={handleCarSubmit}
                        selectedFiles={selectedFiles}
                        uploadedImageCount={uploadedImageCount}
                        handleFilesChange={handleFilesChange}
                        imageError={imageError}
                        uploading={uploading}
                        publishing={publishing}
                        setSelectedFiles={setSelectedFiles}
                        setUploadedImageCount={setUploadedImageCount}
                        setImageError={setImageError}
                        handleImageUpload={handleImageUpload}
                        handlePublishCar={handlePublishCar}
                    />

                    <AuthModal
                        authMode={authMode}
                        setAuthMode={setAuthMode}
                        handleAuthSubmit={handleAuthSubmit}
                        authForm={authForm}
                        handleAuthChange={handleAuthChange}
                        authError={authError}
                        setAuthError={setAuthError}
                        authLoading={authLoading}
                    />
                </>
            )}
        </div>
    );
}

export default App;
