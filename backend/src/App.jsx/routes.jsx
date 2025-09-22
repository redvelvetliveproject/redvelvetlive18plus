import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";          // ejemplo
import CheckoutPage from "./pages/CheckoutPage.jsx";  // tu nuevo checkout
import LoginPage from "./pages/LoginPage.jsx";        // ejemplo
import NotFoundPage from "./pages/NotFoundPage.jsx";  // fallback 404

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de inicio */}
        <Route path="/" element={<HomePage />} />

        {/* Checkout con cripto */}
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta 404 por defecto */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
