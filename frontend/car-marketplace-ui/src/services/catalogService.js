
const CATALOG_URL = "http://localhost:8080/api/catalog";

export async function fetchCatalogBrands() {
  const response = await fetch(`${CATALOG_URL}/brands`);

  if (!response.ok) {
    throw new Error("Avtomobil markalarını yükləmək mümkün olmadı.");
  }

  return await response.json();
}

export async function fetchCatalogModels(brand) {
  const response = await fetch(
    `${CATALOG_URL}/models?make=${encodeURIComponent(brand)}`
  );

  if (!response.ok) {
    throw new Error("Avtomobil modellərini yükləmək mümkün olmadı.");
  }

  return await response.json();
}
