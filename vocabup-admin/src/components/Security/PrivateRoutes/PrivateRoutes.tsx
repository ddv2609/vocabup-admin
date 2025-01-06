import React from "react";
import { useAuth } from "../../../hooks";
import { Navigate, Outlet } from "react-router-dom";
import Home from "../../../routes/Home/Home";

const PrivateRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <Home>
          <Outlet />
        </Home>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
};

export default PrivateRoutes;
