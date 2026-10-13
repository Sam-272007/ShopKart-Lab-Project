import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        const verifyAuthentication = async () => {
            try {
                await api.get("/customers/me");
                if (isMounted) {
                    setStatus("authenticated");
                }
            } catch {
                if (isMounted) {
                    setStatus("unauthenticated");
                }
            }
        };

        verifyAuthentication();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return <p className="page-loading">Checking authentication...</p>;
    }

    if (status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    return children || <Outlet />;
}

export default ProtectedRoute;