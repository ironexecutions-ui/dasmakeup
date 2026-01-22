import React, { useState } from "react";
import { API_URL } from "../../../../config";
import "./sincronizar.css";

export default function Sincronizar() {

    const [status, setStatus] = useState("idle");
    const [mensagem, setMensagem] = useState("");

    async function sincronizar() {
        if (status === "enviando") return;

        setStatus("enviando");
        setMensagem("Enviando...");

        try {
            const r = await fetch(`${API_URL}/das/sincronizar`, {
                method: "POST"
            });

            const j = await r.json();

            if (!r.ok) {
                setMensagem("Erro ao sincronizar");
                setStatus("erro");
                return;
            }

            setMensagem(j.mensagem);
            setStatus("ok");

        } catch {
            setMensagem("Falha de conexão");
            setStatus("erro");
        }
    }

    return (
        <div className="sincronizar-container">
            <button
                className={`sincronizar-btn ${status}`}
                onClick={sincronizar}
                disabled={status === "enviando"}
            >
                {mensagem || "Sincronizar Produtos"}
            </button>
        </div>

    );
}
