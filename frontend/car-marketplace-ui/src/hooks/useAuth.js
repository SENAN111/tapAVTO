
import { useState } from "react";
import { AUTH_URL } from "../data/carData";

function useAuth() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [authMode, setAuthMode] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [authForm, setAuthForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
  });
  function openAuth(mode) {
    setAuthForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "USER",
    });

    setAuthError("");
    setAuthMode(mode);
  }

  function handleAuthChange(event) {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError("");

      const endpoint =
        authMode === "register" ? "/register" : "/login";

      const payload =
        authMode === "register"
          ? authForm
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const response = await fetch(`${AUTH_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Məlumatlar yanlışdır və ya əməliyyat uğursuz oldu."
        );
      }

      if (!data.token) {
        throw new Error("Server token qaytarmadı.");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setAuthMode(null);

      setAuthForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
      });

      alert(
        authMode === "register"
          ? "Qeydiyyat uğurla tamamlandı!"
          : "Sistemə uğurla daxil oldunuz!"
      );
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    alert("Hesabdan çıxış edildi.");
  }

  return {
    token,
    setToken,
    authMode,
    setAuthMode,
    authError,
    setAuthError,
    authLoading,
    authForm,
    handleAuthChange,
    handleAuthSubmit,
    logout,
    openAuth,
  };
}

export default useAuth;
