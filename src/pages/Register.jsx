import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/login");
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <p>Redirecting to login...</p>
        </div>
    );
}
