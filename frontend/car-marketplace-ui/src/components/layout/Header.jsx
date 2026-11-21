
function getUserRoles(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = atob(base64);
    const data = JSON.parse(decoded);

    return data.roles || [];
  } catch (error) {
    return [];
  }
}

function Header({
  token,
  goHome,
  goMyCars,
  goFavorites,
  openCarForm,
  logout,
  openAuth,
}) {
  const roles = getUserRoles(token);

  const isSeller = roles.some(
    (role) =>
      role === "SELLER" || role === "ROLE_SELLER"
  );

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
             onClick={goFavorites}
          >
              ♡ Favoritlərim
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
              {isSeller && (
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
                </>
              )}

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
