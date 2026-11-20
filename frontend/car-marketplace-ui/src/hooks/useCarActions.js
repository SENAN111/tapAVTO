
import { API_URL } from "../data/carData";

function useCarActions({
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
}) {
  async function handleCarSubmit(event) {
    event.preventDefault();

    try {
      setCarFormLoading(true);
      setCarFormError("");

      if (phoneNumber.length !== 7) {
        throw new Error(
          "Telefon nömrəsinin son 7 rəqəmini daxil edin."
        );
      }

      const fullPhoneNumber = `${phonePrefix}${phoneNumber}`;
      const currentYear = new Date().getFullYear();

      if (
        !Number.isInteger(Number(carForm.year)) ||
        Number(carForm.year) < 1886 ||
        Number(carForm.year) > currentYear
      ) {
        throw new Error("Buraxılış ilini düzgün daxil edin.");
      }

      if (!carForm.brand.trim()) {
        throw new Error("Avtomobil markasını daxil edin.");
      }

      if (!carForm.model.trim()) {
        throw new Error("Avtomobil modelini daxil edin.");
      }

      if (!carForm.bodyType) {
        throw new Error("Ban növünü seçin.");
      }

      if (!carForm.color.trim()) {
        throw new Error("Avtomobilin rəngini seçin.");
      }

      if (Number(carForm.price) <= 0) {
        throw new Error("Qiymət 0-dan böyük olmalıdır.");
      }

      if (Number(carForm.mileage) < 0) {
        throw new Error("Yürüş mənfi ola bilməz.");
      }

      const payload = {
        ...carForm,
        year: Number(carForm.year),
        price: Number(carForm.price),
        mileage: Number(carForm.mileage),
        contactPhone: fullPhoneNumber,
      };

      const response = await fetch(
        editingCarId
          ? `${API_URL}/${editingCarId}`
          : API_URL,
        {
          method: editingCarId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            (editingCarId
              ? "Elanı yeniləmək mümkün olmadı."
              : "Maşın yaratmaq mümkün olmadı.")
        );
      }

      if (editingCarId) {
        alert("Elan uğurla yeniləndi.");
        closeCarForm();
        await loadMyCars(token);
        await loadCars();
        return;
      }

      if (!data.id) {
        throw new Error("Server maşının ID-sini qaytarmadı.");
      }

      setDraftCarId(data.id);
      setImageError("");
      setSelectedFiles([]);
      setUploadedImageCount(0);
    } catch (err) {
      setCarFormError(err.message);
    } finally {
      setCarFormLoading(false);
    }
  }

  async function handleDeleteCar(car) {
    const confirmed = window.confirm(
      `${car.brand} ${car.model} elanını silmək istəyirsiniz?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${car.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || data.error || "Elanı silmək mümkün olmadı."
        );
      }

      setMyCars((previous) =>
        previous.filter((item) => item.id !== car.id)
      );

      setCars((previous) =>
        previous.filter((item) => item.id !== car.id)
      );

      setCarImages((previous) => {
        const updated = { ...previous };
        delete updated[car.id];
        return updated;
      });

      if (currentPath === `/cars/${car.id}`) {
        navigate("/my-cars");
      }

      alert("Elan uğurla silindi.");

      await loadMyCars(token);
      await loadCars();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleFilesChange(event) {
    const newFiles = Array.from(event.target.files || []);

    if (newFiles.length === 0) return;

    setImageError("");

    const totalCount = selectedFiles.length + newFiles.length;

    if (totalCount > 10) {
      setImageError(
        "Bir avtomobil üçün maksimum 10 şəkil seçə bilərsiniz."
      );
      event.target.value = "";
      return;
    }

    const invalidFile = newFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setImageError("Yalnız şəkil faylları seçə bilərsiniz.");
      event.target.value = "";
      return;
    }

    setSelectedFiles((previous) => [...previous, ...newFiles]);
    event.target.value = "";
  }

  async function handleImageUpload() {
    if (!draftCarId) {
      setImageError("Maşın ID-si tapılmadı.");
      return;
    }

    if (selectedFiles.length < 5) {
      setImageError(
        "Elanı yayımlamaq üçün ən azı 5 şəkil seçməlisiniz."
      );
      return;
    }

    if (uploadedImageCount >= selectedFiles.length) {
      setImageError("Yüklənəcək yeni şəkil yoxdur.");
      return;
    }

    try {
      setUploading(true);
      setImageError("");

      for (
        let i = uploadedImageCount;
        i < selectedFiles.length;
        i++
      ) {
        const formData = new FormData();
        formData.append("file", selectedFiles[i]);

        const response = await fetch(
          `${API_URL}/${draftCarId}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              `${i + 1}-ci şəkli yükləmək mümkün olmadı.`
          );
        }

        setUploadedImageCount(i + 1);
      }
    } catch (err) {
      setImageError(
        `${err.message} Yüklənmiş şəkillər saxlanılıb. Yenidən cəhd edə bilərsiniz.`
      );
    } finally {
      setUploading(false);
    }
  }

  async function handlePublishCar() {
    if (!draftCarId) return;

    if (uploadedImageCount < 5) {
      setImageError(
        "Elanı yayımlamaq üçün minimum 5 şəkil yükləməlisiniz."
      );
      return;
    }

    try {
      setPublishing(true);
      setImageError("");

      const response = await fetch(
        `${API_URL}/${draftCarId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Elanı yayımlamaq mümkün olmadı."
        );
      }

      alert("Elan uğurla yayımlandı!");

      closeCarForm();
      await loadMyCars(token);
      await loadCars();
    } catch (err) {
      setImageError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  return {
    handleCarSubmit,
    handleDeleteCar,
    handleFilesChange,
    handleImageUpload,
    handlePublishCar,
  };
}

export default useCarActions;
