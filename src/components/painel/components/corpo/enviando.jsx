import React, { useState } from "react";
import { API_URL } from "../../../../config";
import "./enviando.css";

export default function Enviando({ qrInicial = "" }) {

    const [qr, setQr] = useState("");
    const [lista, setLista] = useState([]);
    const [vendaNumero, setVendaNumero] = useState(null);

    const [link, setLink] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [confirmarSemLink, setConfirmarSemLink] = useState(false);
    const [loading, setLoading] = useState(false);
    // Preenche o input automaticamente quando receber da URL
    React.useEffect(() => {
        if (qrInicial) {
            setQr(qrInicial);
            buscarPorQr(qrInicial);
        }
    }, [qrInicial]);

    async function buscarPorQr(valor) {
        setQr(valor);

        if (valor.length < 4) {
            setLista([]);
            setVendaNumero(null);
            return;
        }

        const resp = await fetch(`${API_URL}/das/enviando/buscar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_code: valor })
        });

        const json = await resp.json();

        if (json.ok) {
            setLista(json.produtos);
            setVendaNumero(json.venda_numero);
        } else {
            setLista([]);
            setVendaNumero(null);
        }
    }

    async function enviarDados(forcar = false) {

        if (!link && !mensagem) return;

        if (!link && mensagem && !forcar) {
            setConfirmarSemLink(true);
            return;
        }

        setLoading(true);

        await fetch(`${API_URL}/das/enviando/confirmar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                venda_numero: vendaNumero,
                link,
                mensagem
            })
        });

        setLoading(false);
        setConfirmarSemLink(false);
        setQr("");
        setLista([]);
        setVendaNumero(null);
        setLink("");
        setMensagem("");
    }

    return (
        <main className="env-corpo-painel">
            <h2>Esta pagina so é usada ao ler o QRcode dos produtos que serão enviados a entregadora </h2>

            <input
                type="text"
                placeholder="Ler ou digitar QR Code"
                value={qr}
                onChange={e => buscarPorQr(e.target.value)}
                className="env-input-padrao"
            />

            {lista.length > 0 && (
                <div className="env-lista-produtos-envio">
                    {lista.map((p, i) => (
                        <div key={i} className="env-produto-envio">
                            <img src={p.imagem_um} alt={p.produto} />
                            <span style={{ fontSize: "1.9rem" }} >{p.produto}</span>
                        </div>
                    ))}
                </div>
            )}

            {lista.length > 0 && (
                <>
                    <input
                        style={{ color: "white" }}
                        type="text"
                        placeholder="Link de rastreamento"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        className="env-input-padrao"
                    />

                    <textarea
                        placeholder="Mensagem para o cliente"
                        value={mensagem}
                        onChange={e => setMensagem(e.target.value)}
                        className="env-textarea-padrao"
                    />
                    {confirmarSemLink && (
                        <div className="env-confirmacao-envio">
                            <p>Não tem link de rastreamento. Quer continuar?</p>
                            <button onClick={() => enviarDados(true)}>Sim</button>
                            <button onClick={() => setConfirmarSemLink(false)}>Cancelar</button>
                        </div>
                    )}
                    <button
                        disabled={!link && !mensagem || loading}
                        onClick={() => enviarDados(false)}
                        className="env-btn-acao"
                    >
                        Enviar
                    </button>
                </>
            )}


        </main>
    );
}
