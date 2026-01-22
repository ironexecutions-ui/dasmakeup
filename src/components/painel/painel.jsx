import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

import HeaderPainel from "./components/headerpainel";
import Botoes from "./components/botoes";
import CorpoPainel from "./components/corpopainel";

import "./painel.css";

/* ===============================
   BLOQUEIO DE DISPOSITIVO
=============================== */
function dispositivoNaoPermitido() {
    const ua = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|iphone|ipad|ipod|mobile/;
    const largura = window.innerWidth;

    return mobileRegex.test(ua) || largura < 1024;
}

export default function Painel() {

    const navigate = useNavigate();

    const [bloqueado, setBloqueado] = useState(false);
    const [telaHeader, setTelaHeader] = useState("inicio");
    const [telaBotao, setTelaBotao] = useState(null);

    useEffect(() => {

        // 🚫 BLOQUEIA MOBILE E TABLET
        if (dispositivoNaoPermitido()) {
            setBloqueado(true);
            return;
        }

        async function validar() {
            const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            const token = localStorage.getItem("token");
            const autorizado = localStorage.getItem("painel_autorizado");

            if (!usuario.id || !token || autorizado !== "sim") {
                navigate("/");
                return;
            }

            try {
                const resp = await fetch(`${API_URL}/das/auth/validar-admin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ email: usuario.email })
                });

                const json = await resp.json();

                if (!resp.ok || !json.ok) {
                    navigate("/");
                }

            } catch {
                navigate("/");
            }
        }

        validar();
    }, [navigate]);

    /* ===============================
       FUNÇÕES DE NAVEGAÇÃO
    =============================== */
    function selecionarHeader(tela) {
        setTelaHeader(tela);
        setTelaBotao(null);
    }

    function selecionarBotao(tela) {
        setTelaBotao(tela);
    }

    /* ===============================
       TELA BLOQUEADA
    =============================== */
    if (bloqueado) {
        return (
            <div className="painel-bloqueado">
                <h1>Dispositivo não autorizado</h1>
                <p>
                    Este painel administrativo só pode ser acessado
                    por computador.
                </p>
            </div>
        );
    }

    /* ===============================
       PAINEL NORMAL
    =============================== */
    return (
        <div className="painel-container-pp">

            <HeaderPainel onSelect={selecionarHeader} />

            <div className="painel-conteudo">
                <Botoes onSelect={selecionarBotao} />
                <CorpoPainel
                    telaHeader={telaHeader}
                    telaBotao={telaBotao}
                />
            </div>

        </div>
    );
}
