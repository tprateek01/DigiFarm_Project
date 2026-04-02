import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Blocks access to protected routes unless the user is logged in.
 * Optionally restricts by role.
 */
const RequireAuth = ({ children, loginPath, allowedRoles, message }) => {
  const raw = localStorage.getItem("session_data");
  if (!raw) {
    const query = message ? `?message=${encodeURIComponent(message)}` : "";
    return <Navigate to={`${loginPath}${query}`} replace />;
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    session = null;
  }

  if (!session) {
    const query = message ? `?message=${encodeURIComponent(message)}` : "";
    return <Navigate to={`${loginPath}${query}`} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = String(session.role || "").toLowerCase();
    const allowed = allowedRoles.some(
      (r) => String(r || "").toLowerCase() === role
    );
    if (!allowed) {
      const query = message ? `?message=${encodeURIComponent(message)}` : "";
      return <Navigate to={`${loginPath}${query}`} replace />;
    }
  }

  return children;
};

export default RequireAuth;

