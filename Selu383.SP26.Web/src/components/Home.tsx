function Home() {
  return (
    <div className="card" style={{ padding: "2.5rem", margin: "2rem -3rem", backgroundColor: "rgba(255, 255, 255, 0.75)" }}>
      <img
        src="/src/assets/ConceptLogo2.png"
        alt="Caffeinated Lions Logo"
        style={{ display: "block", margin: "0 auto -3rem", width: "20rem" }}
      />
      <h1
        style={{ textAlign: "center", width: "100%", fontSize: "300%" }}
      >
        Caffeinated Lions
      </h1>
      <p style={{ textAlign: "center", width: "100%", fontSize: "120%", marginTop: "-1.5rem" }}>
        Pouring pride into every cup.
      </p>
    </div>
  );
}

export default Home;
