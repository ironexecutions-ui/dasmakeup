import React, { useEffect, useState } from "react";
import { API_URL } from "../../../config";
import "./modallogin.css";

export default function ModalLogin({ fechar }) {

    const [mostrarTermos, setMostrarTermos] = useState(false);
    const [credencial, setCredencial] = useState(null);
    const [emailGoogle, setEmailGoogle] = useState(null);

    useEffect(() => {
        if (window.google) {
            google.accounts.id.initialize({
                client_id: "337060969671-u0kvppbs1bpl70f0i4cefghb6ev7v157.apps.googleusercontent.com",
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
        }
    }, []);


    async function handleGoogleResponse(response) {
        setCredencial(response.credential);

        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        const email = payload.email;
        setEmailGoogle(email);

        const resp = await fetch(`${API_URL}/das/auth/verificar-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const json = await resp.json();

        if (json.existe) {
            fazerLoginDireto(response.credential);
        } else {
            setMostrarTermos(true);
        }
    }

    async function fazerLoginDireto(credential) {
        const resp = await fetch(`${API_URL}/das/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential })
        });

        const json = await resp.json();

        if (json.ok && json.usuario) {
            localStorage.setItem("usuario", JSON.stringify(json.usuario));
            localStorage.setItem("token", json.token); // IMPORTANTE
            localStorage.setItem("painel_autorizado", "sim");
            fechar();
            window.location.reload();
        }
        else {
            alert("Erro ao autenticar");
        }
    }

    async function aceitarTermos() {
        const resp = await fetch(`${API_URL}/das/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: credencial })
        });

        const json = await resp.json();

        if (json.ok && json.usuario) {
            localStorage.setItem("usuario", JSON.stringify(json.usuario));
            localStorage.setItem("token", json.token); // IMPORTANTE
            localStorage.setItem("painel_autorizado", "sim");
            fechar();
            window.location.reload();
        }
        else {
            alert("Erro ao autenticar. Tente novamente.");
        }
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
                            <li>Concordo com o uso dos meus dados apenas para criação da conta, processamento de pedidos e suporte ao cliente.</li>
                            <li>Autorizo o envio de comunicações essenciais sobre meus pedidos, entregas e informações importantes da Dass.</li>
                            <li>Entendo que meus dados não serão vendidos nem compartilhados com terceiros fora do necessário para pagamento e entrega.</li>
                            <li>Confirmo que posso solicitar a exclusão da minha conta e dos meus dados a qualquer momento.</li>
                        </ul>


                        <button className="log-btn-aceitar" onClick={aceitarTermos}>
                            Aceito os termos e desejo continuar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
