import React, { useEffect, useState } from "react";
import { API_URL } from "../../../config";
import "./pagamento.css";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

export default function PagamentoCheckout({ enviadoId, total, usuario, voltar }) {

    const [statusPagamento, setStatusPagamento] = useState("");
    const [mensagemStatus, setMensagemStatus] = useState("");

    const [pix, setPix] = useState(null);
    const [aba, setAba] = useState("pix");
    const [erro, setErro] = useState("");
    const [gerandoPix, setGerandoPix] = useState(false);
    const [pixErroFatal, setPixErroFatal] = useState(false);
    const [resumo, setResumo] = useState(null);
    useEffect(() => {
        async function carregarResumo() {
            try {
                const r = await fetch(
                    `${API_URL}/das/pagamento/resumo/${enviadoId}`
                );
                const json = await r.json();
                if (r.ok) setResumo(json);
            } catch {
                setErro("Erro ao carregar valores do pagamento");
            }
        }

        carregarResumo();
    }, [enviadoId]);

    // ===============================
    // GERAR PIX
    // ===============================
    useEffect(() => {
        if (aba !== "pix" || pix || gerandoPix || pixErroFatal) return;

        async function gerarPix() {
            try {
                setGerandoPix(true);
                setErro("");

                const r = await fetch(`${API_URL}/das/pagamento/pix`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        enviado_id: enviadoId,
                        email: usuario.email
                    })

                });

                const json = await r.json();

                if (!r.ok) {
                    if (json.motivo) {
                        setErro(`${json.mensagem}: ${json.motivo}`);
                    } else {
                        setErro(json.mensagem || "Erro ao gerar PIX");
                    }
                    setPixErroFatal(true);
                    setGerandoPix(false);
                    return;

                }

                setPix(json);
                setGerandoPix(false);

            } catch (e) {
                setErro("Erro de conexão com o servidor");
                setPixErroFatal(true);
                setGerandoPix(false);

            }
        }

        gerarPix();
    }, [aba, pix, gerandoPix, enviadoId, total, usuario.email]);

    // ===============================
    // POLLING STATUS PAGAMENTO
    // ===============================
    useEffect(() => {
        const timer = setInterval(async () => {
            try {
                const r = await fetch(
                    `${API_URL}/pagamento/status/${enviadoId}`
                );
                const json = await r.json();

                if (json.status === "approved") {
                    clearInterval(timer);
                    setStatusPagamento("approved");
                    setMensagemStatus(json.mensagem || "Pagamento confirmado com sucesso");
                }

                if (json.status === "error") {
                    clearInterval(timer);
                    setStatusPagamento("error");
                    setMensagemStatus(json.mensagem || "Erro no pagamento");
                }

            } catch {
                // erro silencioso para não poluir UX
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [enviadoId]);


    // ===============================
    // COPIAR PIX
    // ===============================
    function copiarPix() {
        if (!pix?.qr_code) return;
        navigator.clipboard.writeText(pix.qr_code);
        alert("Código PIX copiado");
    }

    return (
        <div className="pagamento-container">

            <div className="pagamento-tabs">
                <button
                    className={aba === "pix" ? "ativo" : ""}
                    onClick={() => {
                        setPix(null);
                        setPixErroFatal(false);
                        setAba("pix");
                    }}
                >
                    PIX
                </button>


                <button
                    className={aba === "cartao" ? "ativo" : ""}
                    onClick={() => setAba("cartao")}
                >
                    Cartão
                </button>
            </div>

            {/* ===============================
                PIX
            =============================== */}
            {aba === "pix" && (
                <>
                    {gerandoPix && (
                        <p>Gerando código PIX...</p>
                    )}

                    {pix && (
                        <div className="pagamento-pix">
                            <img
                                src={`data:image/png;base64,${pix.qr_code_base64}`}
                                alt="QR Code PIX"
                            />
                            <button onClick={copiarPix}>
                                Copiar código PIX
                            </button>
                            <p>Aguardando pagamento...</p>
                        </div>
                    )}
                </>
            )}

            {/* ===============================
                CARTÃO (SDK ENTRA AQUI)
            =============================== */}
            {aba === "cartao" && (
                <div className="pagamento-cartao">
                    <CardPayment
                        initialization={{
                            amount: Number(total)
                        }}
                        onSubmit={async (formData) => {
                            try {
                                const r = await fetch(`${API_URL}/das/pagamento/cartao`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        enviado_id: enviadoId,
                                        token: formData.token,
                                        parcelas: formData.installments,
                                        payment_method_id: formData.payment_method_id,
                                        total,
                                        email: usuario.email
                                    })
                                });

                                const json = await r.json();

                                if (!r.ok) {
                                    if (json.motivo) {
                                        setErro(`${json.mensagem}: ${json.motivo}`);
                                    } else {
                                        setErro(json.mensagem || "Pagamento não autorizado");
                                    }
                                    return;
                                }


                                alert("Pagamento aprovado!");
                                window.location.reload();

                            } catch {
                                setErro("Erro de conexão");
                            }
                        }}
                    />
                </div>
            )}
            {resumo && (
                <div className="pagamento-resumo">
                    <div>
                        <span>Subtotal</span>
                        <strong>R$ {resumo.subtotal.toFixed(2)}</strong>
                    </div>

                    <div>
                        <span>Frete</span>
                        <strong>
                            {resumo.frete > 0
                                ? `R$ ${resumo.frete.toFixed(2)}`
                                : "Grátis"}
                        </strong>
                    </div>

                    <div className="total">
                        <span>Total a pagar</span>
                        <strong>R$ {resumo.total.toFixed(2)}</strong>
                    </div>
                </div>
            )}
            {mensagemStatus && (
                <div className={`pagamento-status ${statusPagamento}`}>
                    {mensagemStatus}
                </div>
            )}


            {/* ===============================
                ERRO
            =============================== */}
            {erro && (
                <p className="erro">
                    {erro}
                </p>
            )}
            <button onClick={voltar}>
                Voltar ao carrinho
            </button>

        </div>
    );
}
