
import { API_URL } from "../data/carData";

function validateCarId(carId) {
  if (
    carId === undefined ||
    carId === null ||
    String(carId).trim() === "" ||
    String(carId) === "undefined" ||
    String(carId) === "null"
  ) {
    throw new Error("Avtomobil ID-si düzgün deyil.");
  }
}

function getAuthHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function fetchCars() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Avtomobilləri yükləmək mümkün olmadı.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.content || [];
}

export async function fetchCarById(carId, token) {
  validateCarId(carId);

  const response = await fetch(`${API_URL}/${carId}`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sessiyanın vaxtı bitib. Yenidən daxil olun."
        : "Avtomobil məlumatlarını yükləmək mümkün olmadı."
    );
  }

  return await response.json();
}

export async function fetchCarImages(carId, token) {
  validateCarId(carId);

  const response = await fetch(`${API_URL}/${carId}/images`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Avtomobil şəkillərini yükləmək mümkün olmadı.");
  }

  return await response.json();
}
