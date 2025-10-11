// frontend/pages/index.js
import Head from "next/head";
import React from "react";
import Layout from "../components/Layout.jsx";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>RedVelvetLive 🚀 | Plataforma Web3 de Contenido</title>
        <meta
          name="description"
          content="RedVelvetLive es la plataforma Web3 que revoluciona la industria del contenido para adultos. Pagos instantáneos, sin censura y sin bloqueos."
        />
      </Head>

      <section style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ff003c" }}>
          Bienvenido a RedVelvetLive 🚀
        </h1>
        <p style={{ fontSize: "1.4rem", marginBottom: "2rem", color: "#333" }}>
          La revolución digital de los creadores de contenido para adultos.  
          Pagos al instante, sin intermediarios ni censura injusta.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <a
            href="/login.html"
            style={{
              marginRight: "1rem",
              padding: "0.8rem 1.6rem",
              background: "#ff003c",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Iniciar Sesión
          </a>
          <a
            href="/register.html"
            style={{
              padding: "0.8rem 1.6rem",
              background: "#333",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Crear Cuenta
          </a>
        </div>
      </section>
    </Layout>
  );
}
