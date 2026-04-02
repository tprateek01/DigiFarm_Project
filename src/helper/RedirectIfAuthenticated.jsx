import React from "react";
import { Navigate } from "react-router-dom";

/**
 * If the user is logged in, prevents navigation to login/register pages.
 */
const RedirectIfAuthenticated = ({ children, destinationByRole }) => {
  const raw = localStorage.getItem("session_data");
  if (!raw) return children;

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    return children;
  }

  const role = String(session?.role || "").toLowerCase();
  const dest = destinationByRole?.[role] || "/";
  return <Navigate to={dest} replace />;
};

export default RedirectIfAuthenticated;

