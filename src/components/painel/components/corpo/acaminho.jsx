import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./acaminho.css";

export default function ACaminho() {

    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    async function carregar() {
        setLoading(true);

        const resp = await fetch(`${API_URL}/das/processo/a-caminho`);
        const json = await resp.json();

        setVendas(json.vendas || []);
        setLoading(false);
    }

    useEffect(() => {
        carregar();
    }, []);

    async function confirmarRecebido(venda_numero) {
        await fetch(`${API_URL}/das/processo/chegou`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ venda_numero })
        });

        carregar();
    }

    if (loading) {
        return (
            <main className="corpo-painel">
                <p>Carregando pedidos a caminho...</p>
            </main>
        );
    }

    return (
        <main className="corpo-painel">
            <h2>Pedidos a Caminho</h2>

            {vendas.length === 0 && (
                <p>Nenhum pedido a caminho.</p>
            )}

            {vendas.map(v => (
                <div key={v.venda_numero} className="ac-venda-card">

                    <h3>Venda #{v.venda_numero}</h3>

                    <p className="ac-cliente">
                        Cliente {v.usuario.nome} {v.usuario.sobrenome}
                    </p>

                    {v.usuario.whatsapp && (
                        <a
                            className="ac-whatsapp"
                            href={`https://wa.me/55${v.usuario.whatsapp}?text=${encodeURIComponent(
                                `Olá, tudo bem? Aqui é da Dass. Gostaria de confirmar com vôce se recebeu seu pedido: ${v.produtos.map(p => p.nome).join(", ")}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Enviar mensagem no WhatsApp
                        </a>
                    )}


                    <div className="ac-produtos">
                        {v.produtos.map((p, i) => (
                            <div key={i} className="ac-produto">
                                <img src={p.imagem_um} alt="" />
                                <p>{p.nome}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        className="ac-btn-confirmar"
                        onClick={() => confirmarRecebido(v.venda_numero)}
                    >
                        Cliente recebeu
                    </button>

                </div>
            ))}
        </main>
    );
}
