
import { API_URL } from "../data/carData";

export async function fetchCars() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Avtomobilləri yükləmək mümkün olmadı.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.content || [];
}

export async function fetchCarById(carId) {
  const response = await fetch(`${API_URL}/${carId}`);

  if (!response.ok) {
    throw new Error("Avtomobil məlumatlarını yükləmək mümkün olmadı.");
  }

  return await response.json();
}

export async function fetchCarImages(carId) {
  const response = await fetch(`${API_URL}/${carId}/images`);

  if (!response.ok) {
    throw new Error("Avtomobil şəkillərini yükləmək mümkün olmadı.");
  }

  return await response.json();
}
