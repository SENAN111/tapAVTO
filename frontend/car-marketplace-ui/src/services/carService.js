import { API_URL } from "../data/carData";

export async function fetchCars() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Avtomobilləri yükləmək mümkün olmadı.");
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.content || [];
}