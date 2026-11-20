
function Header({
  token,
  goHome,
  goMyCars,
  openCarForm,
  logout,
  setAuthError,
  setAuthMode,
}) {
  return (
    <header className="header">
      <div className="container header-content">
        <button type="button" className="logo" onClick={goHome}>
          CAR<span>MARKET</span>
        </button>

        <nav className="navigation">
          <button type="button" onClick={goHome}>
            Ana səhifə
          </button>

          <button
            type="button"
            onClick={() => {
              goHome();
              setTimeout(() => {
                document.getElementById("cars")?.scrollIntoView({
                  behavior: "smooth",
                });
              }, 0);
            }}
          >
            Avtomobillər
          </button>

          <button
            type="button"
            onClick={() => {
              goHome();
              setTimeout(() => {
                document.getElementById("about")?.scrollIntoView({
                  behavior: "smooth",
                });
              }, 0);
            }}
          >
            Haqqımızda
          </button>

          <button
            type="button"
            onClick={() => {
              goHome();
              setTimeout(() => {
                document.getElementById("contact")?.scrollIntoView({
                  behavior: "smooth",
                });
              }, 0);
            }}
          >
            Əlaqə
          </button>

          {token ? (
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
                + Maşın əlavə et
              </button>

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
                onClick={() => {
                  setAuthError("");
                  setAuthMode("login");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className="auth-nav-button register-nav-button"
                onClick={() => {
                  setAuthError("");
                  setAuthMode("register");
                }}
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
