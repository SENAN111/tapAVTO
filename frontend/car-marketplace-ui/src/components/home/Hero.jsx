
function Hero({ onBrowseCars }) {
  return (
    <section className="hero" id="home">
      <div className="container hero-content">
        <h1>
          Sürətini seç.
          <br />
          <span>Stilini yaşa.</span>
        </h1>

        <p>
          Xəyalındakı avtomobili kəşf et və yola çıx.
        </p>

        <button
          type="button"
          className="hero-button"
          onClick={onBrowseCars}
        >
          Avtomobillərə bax <span>→</span>
        </button>
      </div>
    </section>
  );
}

export default Hero;
