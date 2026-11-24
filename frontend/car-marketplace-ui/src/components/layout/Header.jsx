
import { useEffect, useRef, useState } from "react";
import "../../styles/Header.css";

function getUserRoles(token) {
    try {
        if (!token) return [];

        const payload = token.split(".")[1];
        if (!payload) return [];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = atob(base64);
        const data = JSON.parse(decoded);
        const roles = data.roles || data.authorities || [];

        return roles.map((role) => {
            if (typeof role === "string") return role;
            return role.authority || role.name || "";
        });
    } catch {
        return [];
    }
}

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080/api"
).replace(/\/cars\/?$/, "");

function Header({
    token,
    goHome,
    goMyCars,
    goFavorites,
    openCarForm,
    logout,
    openAuth,
    navigate,
}) {
    const roles = getUserRoles(token);

    const isSeller = roles.some(
        (role) => role === "SELLER" || role === "ROLE_SELLER"
    );

    const isAdmin = roles.some(
        (role) => role === "ADMIN" || role === "ROLE_ADMIN"
    );

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);

    const notificationRef = useRef(null);

    // Oxunmamış bildirişlərin sayını yüklə
    const loadUnreadCount = async () => {
        if (!token) {
            setUnreadCount(0);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                console.error(
                    "Bildiriş sayı sorğusu uğursuz oldu:",
                    response.status
                );
                return;
            }

            const data = await response.json();

            const countValue =
                typeof data === "number"
                    ? data
                    : data?.unreadCount ??
                      data?.count ??
                      data?.unread ??
                      data?.totalUnread ??
                      data?.data?.unreadCount ??
                      data?.data?.count ??
                      0;

            const count = Number(countValue);

            setUnreadCount(
                Number.isFinite(count) && count > 0 ? count : 0
            );
        } catch (error) {
            console.error("Bildiriş sayı yüklənmədi:", error);
        }
    };

    // Bildiriş siyahısını yüklə
    const loadNotifications = async () => {
        if (!token) return;

        setNotificationLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Bildirişləri yükləmək mümkün olmadı.");
            }

            const data = await response.json();

            setNotifications(
                Array.isArray(data)
                    ? data
                    : data.notifications || data.data || []
            );
        } catch (error) {
            console.error("Bildiriş xətası:", error);
        } finally {
            setNotificationLoading(false);
        }
    };

    // Login zamanı dərhal yoxla, sonra mütəmadi yenilə
    useEffect(() => {
        if (!token) {
            setNotifications([]);
            setUnreadCount(0);
            setShowNotifications(false);
            return;
        }

        loadUnreadCount();

        const interval = setInterval(() => {
            loadUnreadCount();
        }, 10000);

        const handleFocus = () => {
            loadUnreadCount();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadUnreadCount();
            }
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [token]);

    // Bildiriş pəncərəsindən kənara klik
    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // Bildiriş pəncərəsini açıb-bağla
    const toggleNotifications = async () => {
        const nextState = !showNotifications;
        setShowNotifications(nextState);

        if (nextState) {
            await loadNotifications();
            await loadUnreadCount();
        }
    };

    // Bir bildirişi oxunmuş et
    const markAsRead = async (id) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/${id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) return;

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === id
                        ? { ...item, isRead: true }
                        : item
                )
            );

            await loadUnreadCount();
        } catch (error) {
            console.error("Bildiriş oxunmadı:", error);
        }
    };

    // Bütün bildirişləri oxunmuş et
    const markAllAsRead = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) return;

            setNotifications((previous) =>
                previous.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error("Bildirişlər oxunmuş edilmədi:", error);
        }
    };

    // Bildirişə klik
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        setShowNotifications(false);

        if (notification.carId && navigate) {
            if (isAdmin) {
                navigate(`/admin/${notification.carId}`);
            } else {
                navigate(`/cars/${notification.carId}`);
            }
        }
    };

    const scrollToSection = (sectionId) => {
        goHome();

        setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({
                behavior: "smooth",
            });
        }, 0);
    };

    return (
        <header className="header">
            <div className="container header-content">

                {/* LOGO */}
                <button
                    type="button"
                    className="logo"
                    onClick={goHome}
                    aria-label="tapAVTO ana səhifə"
                >
                    tap<span>AVTO</span>
                </button>

                {/* NAVIGATION */}
                <nav className="navigation">
                    <button type="button" onClick={goHome}>
                        Ana səhifə
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToSection("cars")}
                    >
                        Avtomobillər
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToSection("about")}
                    >
                        Haqqımızda
                    </button>

                    {/* FAVORITES */}
                    <button
                        type="button"
                        className="favorites-nav-button"
                        onClick={goFavorites}
                    >
                        <svg
                            className="favorite-icon"
                            viewBox="0 0 24 24"
                            width="19"
                            height="19"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                        </svg>

                        <span>Favoritlərim</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToSection("contact")}
                    >
                        Əlaqə
                    </button>

                    {token ? (
                        <>
                            {/* NOTIFICATIONS */}
                            <div
                                className="notification-wrapper"
                                ref={notificationRef}
                            >
                                <button
                                    type="button"
                                    className={`notification-bell ${
                                        unreadCount > 0 ? "has-unread" : ""
                                    }`}
                                    onClick={toggleNotifications}
                                    aria-label={`Bildirişlər: ${unreadCount} oxunmamış`}
                                    aria-expanded={showNotifications}
                                >
                                    <svg
                                        className="bell-icon"
                                        viewBox="0 0 24 24"
                                        width="21"
                                        height="21"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                        <path d="M10 21h4" />
                                    </svg>

                                    {unreadCount > 0 && (
                                        <span className="notification-count">
                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        <div className="notification-header">
                                            <strong>Bildirişlər</strong>

                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={markAllAsRead}
                                                >
                                                    Hamısını oxunmuş et
                                                </button>
                                            )}
                                        </div>

                                        <div className="notification-list">
                                            {notificationLoading ? (
                                                <p className="notification-empty">
                                                    Yüklənir...
                                                </p>
                                            ) : notifications.length === 0 ? (
                                                <p className="notification-empty">
                                                    Hələ bildiriş yoxdur.
                                                </p>
                                            ) : (
                                                notifications.map(
                                                    (notification) => (
                                                        <button
                                                            type="button"
                                                            key={notification.id}
                                                            className={`notification-item ${
                                                                !notification.isRead
                                                                    ? "unread"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                        >
                                                            <span className="notification-dot">
                                                                {!notification.isRead
                                                                    ? "●"
                                                                    : "○"}
                                                            </span>

                                                            <span className="notification-content">
                                                                <strong>
                                                                    {notification.title}
                                                                </strong>

                                                                <span>
                                                                    {notification.message}
                                                                </span>

                                                                <small>
                                                                    {notification.createdAt
                                                                        ? new Date(
                                                                              notification.createdAt
                                                                          ).toLocaleString(
                                                                              "az-AZ"
                                                                          )
                                                                        : ""}
                                                                </small>
                                                            </span>
                                                        </button>
                                                    )
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ADMIN */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    className="auth-nav-button admin-nav-button"
                                    onClick={() => {
                                        if (navigate) {
                                            navigate("/admin");
                                        } else {
                                            window.location.href = "/admin";
                                        }
                                    }}
                                >
                                    Admin paneli
                                </button>
                            )}

                            {/* SELLER */}
                            {isSeller && !isAdmin && (
                                <>
                                    <button
                                        type="button"
                                        className="auth-nav-button"
                                        onClick={goMyCars}
                                    >
                                        Elanlarım
                                    </button>

                                    <button
                                        type="button"
                                        className="auth-nav-button add-car-button"
                                        onClick={openCarForm}
                                    >
                                        <span>+</span> Maşın əlavə et
                                    </button>
                                </>
                            )}

                            {/* LOGOUT */}
                            <button
                                type="button"
                                className="auth-nav-button"
                                onClick={logout}
                            >
                                Çıxış
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="auth-nav-button"
                                onClick={() => openAuth("login")}
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                className="auth-nav-button register-nav-button"
                                onClick={() => openAuth("register")}
                            >
                                Qeydiyyat
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
