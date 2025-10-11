// frontend/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { getSessionProfile } from '../hooks/use-session.js';
import { enforceRoleGuard } from '../hooks/use-role-guard.js';

export default function ProtectedRoute({
  children,
  requiredRole = null, // 'model', 'client', 'admin'...
  redirectTo = '/login.html',
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getSessionProfile();
      if (!user) {
        window.location.href = redirectTo;
        return;
      }

      if (requiredRole && (user.role || '').toLowerCase() !== requiredRole.toLowerCase()) {
        window.location.href = '/unauthorized.html';
        return;
      }

      setAuthorized(true);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p>;
  }

  return authorized ? children : null;
}
