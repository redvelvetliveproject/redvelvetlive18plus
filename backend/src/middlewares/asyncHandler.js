// backend/src/middlewares/asyncHandler.js
/**
 * Wrapper para capturar errores en rutas async
 * evitando el uso manual de try/catch en cada controlador.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
