import React, { useEffect, useState } from "react";
import { API_URL } from "../../../config";
import "./modallogin.css";

export default function ModalLogin({ fechar }) {

    const [mostrarTermos, setMostrarTermos] = useState(false);
    const [credencial, setCredencial] = useState(null);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!window.google || !google.accounts?.id) return;

        google.accounts.id.initialize({
            client_id: "992388111982-a0hootauhov3044flkk0pr4ndtsqiug7.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
            ux_mode: "popup"
        });

        google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            {
                theme: "filled_blue",
                size: "large",
                shape: "pill",
                width: 260
            }
        );
    }, []);

    async function handleGoogleResponse(response) {
        setCredencial(response.credential);
        setCarregando(true);

        const resp = await fetch(`${API_URL}/das/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential })
        });

        const json = await resp.json();

        if (json.ok && json.usuario) {
            localStorage.setItem("usuario", JSON.stringify(json.usuario));
            localStorage.setItem("token", json.token);
            localStorage.setItem("painel_autorizado", "sim");
            fechar();
            window.location.reload();
            return;
        }

        if (json.detail === "Termos não aceitos") {
            setMostrarTermos(true);
        } else {
            alert("Erro ao autenticar com Google");
        }

        setCarregando(false);
    }

    async function aceitarTermos() {
        if (!credencial) return;

        setCarregando(true);

        const resp = await fetch(`${API_URL}/das/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                credential: credencial,
                aceitar_termos: true
            })
        });

        const json = await resp.json();

        if (json.ok && json.usuario) {
            localStorage.setItem("usuario", JSON.stringify(json.usuario));
            localStorage.setItem("token", json.token);
            localStorage.setItem("painel_autorizado", "sim");
            fechar();
            window.location.reload();
        } else {
            alert("Erro ao autenticar. Tente novamente.");
        }

        setCarregando(false);
    }

    return (
        <div className="log-login-overlay" onClick={fechar}>
            <div className="log-login-box" onClick={e => e.stopPropagation()}>

                {!mostrarTermos && (
                    <>
                        <h2 className="log-login-titulo">Entrar</h2>
                        <div id="googleBtn" className="log-google-btn-area"></div>
                        <p className="log-login-desc">
                            Entre para gerenciar sua conta, acompanhar pedidos e receber comunicações da Dass.
                        </p>
                    </>
                )}

                {mostrarTermos && (
                    <div className="log-termos-box">
                        <h3 className="log-termos-titulo">Termos de uso</h3>
                        <p className="log-termos-intro">
                            Para continuar, confirme que concorda com nossas políticas.
                        </p>

                        <ul className="log-termos-lista">
                            <li>Uso dos dados apenas para criação da conta e pedidos.</li>
                            <li>Envio de comunicações essenciais.</li>
                            <li>Dados não vendidos a terceiros.</li>
                            <li>Exclusão da conta a qualquer momento.</li>
                        </ul>

                        <button
                            className="log-btn-aceitar"
                            onClick={aceitarTermos}
                            disabled={carregando}
                        >
                            Aceito os termos e desejo continuar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
