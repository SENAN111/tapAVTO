
import { useEffect, useState } from "react";

function getStorageKey(token) {
    if (!token) {
        return "tapAVTO_favorites_guest";
    }

    try {
        const payload = token.split(".")[1];

        if (!payload) {
            return "tapAVTO_favorites_guest";
        }

        const normalized = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded =
            normalized +
            "=".repeat((4 - (normalized.length % 4)) % 4);

        const decoded = atob(padded);
        const data = JSON.parse(decoded);

        const userId =
            data.userId ||
            data.id ||
            data.sub ||
            data.email;

        return userId
            ? `tapAVTO_favorites_${userId}`
            : "tapAVTO_favorites_guest";
    } catch (error) {
        console.error("İstifadəçi məlumatı oxunmadı:", error);
        return "tapAVTO_favorites_guest";
    }
}

function readFavorites(storageKey) {
    try {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Favoritlər oxunmadı:", error);
        return [];
    }
}

export default function useFavorites(token) {
    const storageKey = getStorageKey(token);

    const [favoriteIds, setFavoriteIds] = useState(
        () => readFavorites(storageKey)
    );

    const [loadedStorageKey, setLoadedStorageKey] = useState(
        storageKey
    );

    useEffect(() => {
        if (loadedStorageKey !== storageKey) {
            setFavoriteIds(readFavorites(storageKey));
            setLoadedStorageKey(storageKey);
        }
    }, [storageKey, loadedStorageKey]);

    useEffect(() => {
        if (loadedStorageKey !== storageKey) {
            return;
        }

        localStorage.setItem(
            storageKey,
            JSON.stringify(favoriteIds)
        );
    }, [favoriteIds, storageKey, loadedStorageKey]);

    function toggleFavorite(carId) {
        setFavoriteIds((currentIds) => {
            const exists = currentIds.some(
                (id) => Number(id) === Number(carId)
            );

            return exists
                ? currentIds.filter(
                    (id) => Number(id) !== Number(carId)
                )
                : [...currentIds, carId];
        });
    }

    function isFavorite(carId) {
        return favoriteIds.some(
            (id) => Number(id) === Number(carId)
        );
    }

    return {
        favoriteIds,
        toggleFavorite,
        isFavorite,
    };
}
