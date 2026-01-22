import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    const estaLogado = Boolean(usuario.id);
    const ehAdmin = usuario.funcao && usuario.funcao.toLowerCase() === "admin";

    console.log("DEBUG ProtectedRoute:", { usuario, estaLogado, ehAdmin }); // ADICIONE TEMPORARIAMENTE

    if (!estaLogado || !ehAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
