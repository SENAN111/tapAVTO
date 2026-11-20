
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

import useCars from "./hooks/useCars";
import useAuth from "./hooks/useAuth";
import useCarActions from "./hooks/useCarActions";
import useCarForm from "./hooks/useCarForm";

import {
  brands,
  carModels,
  carColors,
  bodyTypes,
  phonePrefixes,
} from "./data/carData";

import { getCategory } from "./utils/carUtils";

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
  } = useAuth();

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImageCount, setUploadedImageCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imageError, setImageError] = useState("");

  const {
    showCarForm,
    carForm,
    editingCarId,
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

  const carPageMatch = currentPath.match(/^\/cars\/(\d+)\/?$/);
  const isMyCarsPage = currentPath === "/my-cars";

  const selectedCar = carPageMatch
    ? cars.find((car) => String(car.id) === carPageMatch[1]) ||
      myCars.find((car) => String(car.id) === carPageMatch[1])
    : null;

  const isCarPage = Boolean(carPageMatch);

  const selectedImages = selectedCar
    ? carImages[selectedCar.id] || []
    : [];

  function navigate(path) {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    setActiveImage(0);
    setShowLightbox(false);
    window.scrollTo(0, 0);
  }

  function resetCarForm() {
    resetCarFormFields();
    setDraftCarId(null);
    setSelectedFiles([]);
    setUploadedImageCount(0);
    setImageError("");
    setCarFormLoading(false);
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
    setImageError("");
    setCarFormError("");
    setCarFormLoading(false);
  }

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

  useEffect(() => {
    if (!showLightbox) return;

    function handleLightboxKeyDown(event) {
      if (event.key === "Escape") {
        setShowLightbox(false);
      }

      if (event.key === "ArrowRight" && selectedImages.length > 1) {
        setActiveImage(
          (current) => (current + 1) % selectedImages.length
        );
      }

      if (event.key === "ArrowLeft" && selectedImages.length > 1) {
        setActiveImage(
          (current) =>
            (current - 1 + selectedImages.length) %
            selectedImages.length
        );
      }
    }

    document.addEventListener("keydown", handleLightboxKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleLightboxKeyDown);
      document.body.style.overflow = "";
    };
  }, [showLightbox, selectedImages.length]);

  const filteredCars = cars.filter((car) => {
    const text =
      `${car.brand || ""} ${car.model || ""} ${car.year || ""}`.toLowerCase();

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
      (current) => (current + 1) % selectedImages.length
    );
  }

  function previousImage() {
    if (selectedImages.length <= 1) return;

    setActiveImage(
      (current) =>
        (current - 1 + selectedImages.length) % selectedImages.length
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
        openCarForm={openCarForm}
        logout={logout}
        setAuthError={setAuthError}
        setAuthMode={setAuthMode}
      />

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
      ) : !isCarPage ? (
        <main>
          <Hero
            onBrowseCars={() =>
              document.getElementById("cars")?.scrollIntoView({
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
          />

          <section className="about-section" id="about">
            <div className="container">
              <p className="eyebrow">BİZ KİMİK?</p>
              <h2>Car Marketplace haqqında</h2>
              <p>
                Car Marketplace avtomobil alqı-satqısını daha rahat və
                əlçatan etmək üçün yaradılmış platformadır.
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
        draftCarId={draftCarId}
        setDraftCarId={setDraftCarId}
        brands={brands}
        carModels={carModels}
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
    </div>
  );
}

export default App;
