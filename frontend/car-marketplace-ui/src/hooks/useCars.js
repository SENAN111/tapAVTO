
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../data/carData";
import { fetchCars } from "../services/carService";

function useCars(token) {
  const [cars, setCars] = useState([]);
  const [myCars, setMyCars] = useState([]);
  const [carImages, setCarImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Avtomobillərin şəkillərini yükləyirik
  const loadImagesForCars = useCallback(async (carList) => {
    const results = await Promise.all(
      carList.map(async (car) => {
        try {
          const imageResponse = await fetch(
            `${API_URL}/${car.id}/images`
          );

          if (!imageResponse.ok) return [car.id, []];

          const imageData = await imageResponse.json();

          const images = Array.isArray(imageData)
            ? imageData
            : imageData.content || [];

          images.sort(
            (a, b) =>
              (a.displayOrder || 0) - (b.displayOrder || 0)
          );

          return [car.id, images];
        } catch {
          return [car.id, []];
        }
      })
    );

    setCarImages((previous) => ({
      ...previous,
      ...Object.fromEntries(results),
    }));
  }, []);

  // Bütün avtomobilləri yükləyirik
  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const carList = await fetchCars();

      setCars(carList);
      await loadImagesForCars(carList);
    } catch (err) {
      setError(err.message || "Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  }, [loadImagesForCars]);

  // İstifadəçinin şəxsi elanlarını yükləyirik
  const loadMyCars = useCallback(async (authToken = token) => {
    if (!authToken) {
      setMyCars([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/my-cars`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Sessiyanın vaxtı bitib. Yenidən daxil olun."
          );
        }

        throw new Error(
          "Şəxsi elanları yükləmək mümkün olmadı."
        );
      }

      const data = await response.json();

      const carList = Array.isArray(data)
        ? data
        : data.content || [];

      setMyCars(carList);
      await loadImagesForCars(carList);
    } catch (err) {
      setError(
        err.message || "Elanları yükləmək mümkün olmadı."
      );
    }
  }, [token, loadImagesForCars]);

  // İlk yükləmə
  useEffect(() => {
    loadCars();
  }, [loadCars]);

  // Token dəyişəndə şəxsi elanları yeniləyirik
  useEffect(() => {
    if (token) {
      loadMyCars(token);
    } else {
      setMyCars([]);
    }
  }, [token, loadMyCars]);

  return {
    cars,
    setCars,
    myCars,
    setMyCars,
    carImages,
    setCarImages,
    loading,
    error,
    setError,
    loadCars,
    loadMyCars,
  };
}

export default useCars;
