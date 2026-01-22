import React, { useEffect, useState } from "react";
import { API_URL } from "../../../config";
import "./headerpainel.css";

export default function HeaderPainel({ onSelect }) {
    const [info, setInfo] = useState(null);
    const [ativo, setAtivo] = useState("inicio");

    async function carregar() {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        const token = localStorage.getItem("token");

        if (!usuario.email || !token) return;

        const resp = await fetch(`${API_URL}/das/painel/info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: usuario.email })
        });

        const json = await resp.json();
        if (json.ok) setInfo(json);
    }

    useEffect(() => {
        carregar();

        const intervalo = setInterval(() => {
            carregar();
        }, 15 * 60 * 1000);

        return () => clearInterval(intervalo);
    }, []);

    function clickItem(type) {
        setAtivo(type);
        if (onSelect) onSelect(type);
    }

    return (
        <header className="hp-header">
            <div className={`hp-user-line ${!info ? "skeleton" : ""}`}>

                <span className="hp-user-name">
                    {info ? `${info.usuario_nome} ${info.usuario_sobrenome}` : "Carregando"}
                </span>

                <button
                    className={`hp-count ${ativo === "clientes" ? "ativo" : ""}`}
                    onClick={() => clickItem("clientes")}
                    disabled={!info}
                >
                    Clientes <strong>{info ? info.clientes : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "admins" ? "ativo" : ""}`}
                    onClick={() => clickItem("admins")}
                    disabled={!info}
                >
                    Admins <strong>{info ? info.admins : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "pedidos" ? "ativo" : ""}`}
                    onClick={() => clickItem("pedidos")}
                    disabled={!info}
                >
                    Pedidos <strong>{info ? info.pedidos : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "pagos" ? "ativo" : ""}`}
                    onClick={() => clickItem("pagos")}
                    disabled={!info}
                >
                    Pagos <strong>{info ? info.pagos : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "enviando" ? "ativo" : ""}`}
                    onClick={() => clickItem("enviando")}
                    disabled={!info}
                >
                    Enviando <strong>{info ? info.enviando : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "a_caminho" ? "ativo" : ""}`}
                    onClick={() => clickItem("a_caminho")}
                    disabled={!info}
                >
                    A Caminho <strong>{info ? info.a_caminho : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "entregues" ? "ativo" : ""}`}
                    onClick={() => clickItem("entregues")}
                    disabled={!info}
                >
                    Entregues <strong>{info ? info.entregues : "00"}</strong>
                </button>

                <button
                    className={`hp-count ${ativo === "cancelados" ? "ativo" : ""}`}
                    onClick={() => clickItem("cancelados")}
                    disabled={!info}
                >
                    Cancelados <strong>{info ? info.cancelados : "00"}</strong>
                </button>

            </div>
        </header>
    );
}
