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
          content="RedVelvetLive es la plataforma Web3 que revoluciona la industria del contenido para adultos. Pagos instantáneos, sin censura y sin bloqueos injustos."
        />
        <meta
          name="keywords"
          content="RedVelvetLive, modelos webcam, contenido adulto, blockchain, pagos cripto, ONECOP, streaming Web3"
        />
        <meta property="og:title" content="RedVelvetLive 🚀 | Web3 para modelos" />
        <meta
          property="og:description"
          content="Pagos al instante, sin intermediarios, sin bloqueos injustos. RedVelvetLive: la revolución del contenido Web3."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.redvelvetlive.com" />
        <meta property="og:image" content="/assets/img/og-banner.webp" />
      </Head>

      <section
        style={{
          textAlign: "center",
          padding: "5rem 2rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            color: "#ff003c",
            fontWeight: "bold",
          }}
        >
          Bienvenido a RedVelvetLive 🚀
        </h1>
        <p
          style={{
            fontSize: "1.4rem",
            marginBottom: "2rem",
            color: "#333",
            lineHeight: "1.6",
          }}
        >
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
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#cc0030")}
            onMouseLeave={(e) => (e.target.style.background = "#ff003c")}
          >
            Iniciar Sesión
          </a>
          <a
            href="/register.html"
            style={{
              padding: "0.8rem 1.6rem",
              background: "#222",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#000")}
            onMouseLeave={(e) => (e.target.style.background = "#222")}
          >
            Crear Cuenta
          </a>
        </div>

        <div style={{ marginTop: "4rem" }}>
          <a
            href="/models"
            style={{
              color: "#ff003c",
              fontWeight: "600",
              fontSize: "1.1rem",
              textDecoration: "underline",
            }}
          >
            🌹 Explorar modelos destacadas →
          </a>
        </div>
      </section>
    </Layout>
  );
}

