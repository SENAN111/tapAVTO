
function AuthModal({
  authMode,
  setAuthMode,
  handleAuthSubmit,
  authForm,
  handleAuthChange,
  authError,
  setAuthError,
  authLoading,
}) {
  if (!authMode) return null;

  return (
    <div
      className="auth-backdrop"
      onClick={() => setAuthMode(null)}
    >
      <form
        className="auth-modal"
        onSubmit={handleAuthSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          onClick={() => setAuthMode(null)}
          aria-label="Bağla"
        >
          ×
        </button>

        <h2>
          {authMode === "login"
            ? "Hesaba daxil ol"
            : "Qeydiyyatdan keç"}
        </h2>

        {authMode === "register" && (
          <>
            <input
              name="firstName"
              placeholder="Ad"
              value={authForm.firstName}
              onChange={handleAuthChange}
              required
            />

            <input
              name="lastName"
              placeholder="Soyad"
              value={authForm.lastName}
              onChange={handleAuthChange}
              required
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={authForm.email}
          onChange={handleAuthChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Şifrə"
          value={authForm.password}
          onChange={handleAuthChange}
          minLength={authMode === "register" ? 8 : undefined}
          required
        />

        {authMode === "register" && (
          <select
            name="role"
            value={authForm.role}
            onChange={handleAuthChange}
          >
            <option value="USER">İstifadəçi</option>
            <option value="SELLER">Satıcı</option>
          </select>
        )}

        {authError && (
          <p className="auth-error">{authError}</p>
        )}

        <button
          type="submit"
          className="auth-submit"
          disabled={authLoading}
        >
          {authLoading
            ? "Gözləyin..."
            : authMode === "login"
              ? "Daxil ol"
              : "Qeydiyyatdan keç"}
        </button>

        <p className="auth-switch">
          {authMode === "login"
            ? "Hesabınız yoxdur?"
            : "Artıq hesabınız var?"}

          <button
            type="button"
            onClick={() => {
              setAuthError("");
              setAuthMode(
                authMode === "login" ? "register" : "login"
              );
            }}
          >
            {authMode === "login" ? "Qeydiyyat" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default AuthModal;
