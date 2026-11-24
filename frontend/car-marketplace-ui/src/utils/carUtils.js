
import { bodyTypes } from "../data/carData";

export function formatPrice(value) {
  return Number(value || 0).toLocaleString("az-AZ");
}

export function getFuel(value) {
  const fuels = {
    PETROL: "Benzin",
    DIESEL: "Dizel",
    HYBRID: "Hibrid",
    ELECTRIC: "Elektrik",
    GAS: "Qaz",
  };

  return fuels[value] || value || "Məlum deyil";
}

export function getTransmission(value) {
  const types = {
    AUTOMATIC: "Avtomat",
    MANUAL: "Mexaniki",
  };

  return types[value] || value || "Məlum deyil";
}

export function getBodyType(value) {
  const type = bodyTypes.find((item) => item.value === value);
  return type?.label || value || "Məlum deyil";
}

export function getCategory(car) {
  const name =
    `${car.brand || ""} ${car.model || ""}`.toLowerCase();

  const suvModels = [
    "x1", "x3", "x5", "x6", "x7",
    "gle", "glc", "gls", "q5", "q7",
    "q8", "cayenne", "tucson", "sportage",
    "sorento", "range rover", "touareg",
  ];

  return suvModels.some((model) => name.includes(model))
    ? "suv"
    : "sedan";
}

export function getCarStatus(car) {
  return car?.status || car?.carStatus || "UNKNOWN";
}

export function getStatusLabel(car) {
  const status =
    typeof car === "string" ? car : getCarStatus(car);

  const statuses = {
    DRAFT: "Qaralama",
    PENDING: "Admin yoxlamasında",
    APPROVED: "Təsdiqlənib",
    REJECTED: "Rədd edilib",
    PUBLISHED: "Dərc edilib",
    DELETED: "Silinib",
    UNKNOWN: "Status məlum deyil",
  };

  return statuses[status] || "Status məlum deyil";
}

export function getPrimaryImage(car, carImages = {}) {
  const images = carImages[car.id] || [];

  const primary = images.find(
    (image) =>
      image.primary === true || image.isPrimary === true
  );

  return primary?.imageUrl || images[0]?.imageUrl || "";
}
