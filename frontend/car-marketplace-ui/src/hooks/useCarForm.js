
import { useEffect, useState } from "react";

import {
    emptyCarForm,
    carColors,
    phonePrefixes,
} from "../data/carData";

import {
    fetchCatalogBrands,
    fetchCatalogModels,
} from "../services/catalogService";

function useCarForm({ token, setAuthError, setAuthMode }) {
    const [showCarForm, setShowCarForm] = useState(false);
    const [carForm, setCarForm] = useState({ ...emptyCarForm });

    const [editingCarId, setEditingCarId] = useState(null);
    const [editingCarStatus, setEditingCarStatus] = useState(null);

    // PostgreSQL kataloqundan gələn məlumatlar
    const [brands, setBrands] = useState([]);
    const [carModels, setCarModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);

    const [brandChoice, setBrandChoice] = useState("");
    const [modelChoice, setModelChoice] = useState("");
    const [colorChoice, setColorChoice] = useState("");

    const [phonePrefix, setPhonePrefix] = useState("+99450");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [carFormError, setCarFormError] = useState("");

    // Marka siyahısını PostgreSQL kataloqundan yüklə
    useEffect(() => {
        let cancelled = false;

        async function loadBrands() {
            try {
                const data = await fetchCatalogBrands();

                if (!Array.isArray(data)) {
                    throw new Error("Marka siyahısının formatı düzgün deyil.");
                }

                if (!cancelled) {
                    setBrands(data);
                }
            } catch (error) {
                console.error("Markalar yüklənmədi:", error);

                if (!cancelled) {
                    setBrands([]);
                    setCarFormError(
                        error.message || "Markaları yükləmək mümkün olmadı."
                    );
                }
            }
        }

        loadBrands();

        return () => {
            cancelled = true;
        };
    }, []);

    // Redaktə edilən markanın kataloqda olub-olmadığını yoxla
    useEffect(() => {
        if (
            brands.length === 0 ||
            !editingCarId ||
            !carForm.brand
        ) {
            return;
        }

        if (!brands.includes(carForm.brand)) {
            setBrandChoice("__OTHER__");
        }
    }, [brands, editingCarId, carForm.brand]);

    // Seçilmiş markaya uyğun modelləri PostgreSQL-dən yüklə
    useEffect(() => {
        let cancelled = false;

        async function loadModels() {
            if (!brandChoice || brandChoice === "__OTHER__") {
                setCarModels([]);
                setModelsLoading(false);
                return;
            }

            setModelsLoading(true);
            setCarModels([]);

            try {
                const data = await fetchCatalogModels(brandChoice);

                if (!Array.isArray(data)) {
                    throw new Error("Model siyahısının formatı düzgün deyil.");
                }

                if (cancelled) return;

                setCarModels(data);

                // Redaktə zamanı əvvəlki modeli saxla.
                if (editingCarId && carForm.model) {
                    if (data.includes(carForm.model)) {
                        setModelChoice(carForm.model);
                    } else {
                        setModelChoice("__OTHER__");
                    }
                }
            } catch (error) {
                console.error("Modellər yüklənmədi:", error);

                if (!cancelled) {
                    setCarModels([]);
                    setCarFormError(
                        error.message || "Modelləri yükləmək mümkün olmadı."
                    );
                }
            } finally {
                if (!cancelled) {
                    setModelsLoading(false);
                }
            }
        }

        loadModels();

        return () => {
            cancelled = true;
        };
    }, [brandChoice]);

    function resetCarForm() {
        setCarForm({
            ...emptyCarForm,
            features: [],
        });

        setBrandChoice("");
        setModelChoice("");
        setColorChoice("");

        setPhonePrefix("+99450");
        setPhoneNumber("");

        setCarFormError("");

        setEditingCarId(null);
        setEditingCarStatus(null);
    }

    function openCarForm() {
        if (!token) {
            setAuthError("");
            setAuthMode("login");
            return;
        }

        resetCarForm();
        setShowCarForm(true);
    }

    function closeCarForm() {
        setShowCarForm(false);
        resetCarForm();
    }

    function handleBrandChange(event) {
        const value = event.target.value;

        setBrandChoice(value);
        setModelChoice("");
        setCarModels([]);
        setCarFormError("");

        setCarForm((previous) => ({
            ...previous,
            brand: value === "__OTHER__" ? "" : value,
            model: "",
        }));
    }

    function handleModelChange(event) {
        const value = event.target.value;

        setModelChoice(value);

        setCarForm((previous) => ({
            ...previous,
            model: value === "__OTHER__" ? "" : value,
        }));
    }

    function handleCarChange(event) {
        const { name, value } = event.target;

        setCarForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    // Avtomobil təchizatlarının seçilməsi və seçimdən çıxarılması
    function handleFeatureChange(feature, checked) {
        setCarForm((previous) => {
            const currentFeatures = Array.isArray(previous.features)
                ? previous.features
                : [];

            return {
                ...previous,
                features: checked
                    ? [...new Set([...currentFeatures, feature])]
                    : currentFeatures.filter((item) => item !== feature),
            };
        });
    }

    function handleColorChange(event) {
        const value = event.target.value;

        setColorChoice(value);

        setCarForm((previous) => ({
            ...previous,
            color: value === "Digər" ? "" : value,
        }));
    }

    function handlePhonePrefixChange(event) {
        setPhonePrefix(event.target.value);
    }

    function handlePhoneNumberChange(event) {
        const value = event.target.value
            .replace(/\D/g, "")
            .slice(0, 7);

        setPhoneNumber(value);
    }

    function openEditForm(car) {
        if (!car) return;

        const phone = car.contactPhone || "";

        const matchedPrefix = phonePrefixes.find((prefix) =>
            phone.startsWith(prefix.value)
        );

        const selectedPrefix = matchedPrefix?.value || "+99450";

        const remainingPhone = phone.startsWith(selectedPrefix)
            ? phone.slice(selectedPrefix.length)
            : phone.replace(/\D/g, "").slice(-7);

        setCarForm({
            brand: car.brand || "",
            model: car.model || "",
            year: car.year || "",
            price: car.price ?? "",
            mileage: car.mileage ?? "",
            horsePower: car.horsePower ?? "",
            engineVolume: car.engineVolume ?? "",
            location: car.location || "",
            fuelType: car.fuelType || "PETROL",
            transmission: car.transmission || "AUTOMATIC",
            bodyType: car.bodyType || "",
            seatCount: car.seatCount || "",
            drivetrain: car.drivetrain || "",
            color: car.color || "",
            description: car.description || "",
            contactPhone: phone,

            // Redaktə zamanı əvvəlki təchizatları yüklə
            features: Array.isArray(car.features)
                ? car.features
                : [],
        });

        setBrandChoice(car.brand || "__OTHER__");
        setModelChoice(car.model || "");

        setColorChoice(
            carColors.includes(car.color)
                ? car.color
                : "Digər"
        );

        setPhonePrefix(selectedPrefix);
        setPhoneNumber(remainingPhone);

        setEditingCarId(car.id);
        setEditingCarStatus(car.status || null);

        setShowCarForm(true);
        setCarFormError("");
    }

    return {
        showCarForm,
        setShowCarForm,

        carForm,
        setCarForm,

        editingCarId,
        setEditingCarId,
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

        resetCarForm,
        openCarForm,
        closeCarForm,

        handleBrandChange,
        handleModelChange,
        handleCarChange,
        handleFeatureChange,
        handleColorChange,
        handlePhonePrefixChange,
        handlePhoneNumberChange,

        openEditForm,
    };
}

export default useCarForm;
