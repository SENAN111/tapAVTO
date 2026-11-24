
import { useState } from "react";
import {
    emptyCarForm,
    carModels,
    carColors,
    phonePrefixes,
} from "../data/carData";

function useCarForm({ token, setAuthError, setAuthMode }) {
    const [showCarForm, setShowCarForm] = useState(false);
    const [carForm, setCarForm] = useState({ ...emptyCarForm });
    const [editingCarId, setEditingCarId] = useState(null);
    const [editingCarStatus, setEditingCarStatus] = useState(null);

    const [brandChoice, setBrandChoice] = useState("");
    const [modelChoice, setModelChoice] = useState("");
    const [colorChoice, setColorChoice] = useState("");

    const [phonePrefix, setPhonePrefix] = useState("+99450");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [carFormError, setCarFormError] = useState("");

    function resetCarForm() {
        setCarForm({ ...emptyCarForm });
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
        const phone = car.contactPhone || "";

        const matchedPrefix = phonePrefixes.find((prefix) =>
            phone.startsWith(prefix.value)
        );

        const selectedPrefix = matchedPrefix?.value || "+99450";

        const remainingPhone = phone.startsWith(selectedPrefix)
            ? phone.slice(selectedPrefix.length)
            : phone.replace(/\D/g, "").slice(-7);

        const brandExists = Object.prototype.hasOwnProperty.call(
            carModels,
            car.brand
        );

        const modelExists = brandExists
            ? carModels[car.brand].includes(car.model)
            : false;

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
        });

        setBrandChoice(brandExists ? car.brand : "__OTHER__");

        setModelChoice(
            brandExists && modelExists
                ? car.model
                : "__OTHER__"
        );

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
        handleColorChange,
        handlePhonePrefixChange,
        handlePhoneNumberChange,

        openEditForm,
    };
}

export default useCarForm;
