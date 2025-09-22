// backend/src/pages/CheckoutPage.jsx
import PayWithCrypto from "../components/PayWithCrypto.jsx";

/**
 * Página de Checkout:
 * - Renderiza el componente PayWithCrypto
 * - Centraliza el flujo de pago con USDT/ONECOP
 */
export default function CheckoutPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Checkout</h2>
      <PayWithCrypto />
    </main>
  );
}
