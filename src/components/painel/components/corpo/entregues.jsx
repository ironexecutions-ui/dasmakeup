import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./entregues.css";

export default function Entregues() {

    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            const resp = await fetch(`${API_URL}/das/entregues`);
            const json = await resp.json();

            if (json.ok) {
                setVendas(json.vendas);
            }

            setLoading(false);
        }

        carregar();
    }, []);

    if (loading) {
        return (
            <main className="corpo-painel">
                <p>Carregando pedidos entregues...</p>
            </main>
        );
    }
    async function cancelarVenda(venda_numero) {
        const ok = window.confirm("Tem certeza que deseja cancelar esta venda?");

        if (!ok) return;

        await fetch(`${API_URL}/das/entregues/cancelar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ venda_numero })
        });

        setVendas(vendas.filter(v => v.venda_numero !== venda_numero));
    }

    return (
        <main className="corpo-painel">
            <h2>Pedidos Entregues</h2>

            {vendas.length === 0 && (
                <p>Nenhum pedido entregue ainda.</p>
            )}

            {vendas.map(venda => (
                <div key={venda.venda_numero} className="entregue-card">

                    <div className="entregue-topo">
                        <h3>Venda #{venda.venda_numero}</h3>
                        <span className="data-chegou">
                            Entregue em {new Date(venda.data_chegou).toLocaleDateString("pt-BR")}
                        </span>
                    </div>

                    <div className="cliente-info">
                        <p><strong>Cliente:</strong> {venda.cliente.nome} {venda.cliente.sobrenome}</p>
                        <p><strong>WhatsApp:</strong> {venda.cliente.whatsapp}</p>
                        <p><strong>Email:</strong> {venda.cliente.email}</p>
                    </div>

                    <div className="produtos-entregues">
                        {venda.produtos.map((p, i) => (
                            <div key={i} className="produto-item">
                                <img src={p.imagem_um} alt={p.produto} />

                                <div className="produto-texto">
                                    <span>{p.produto}</span>

                                    {typeof p.carateristica === "string" && p.carateristica.trim() && (
                                        <small className="produto-caracteristica">
                                            {p.carateristica}
                                        </small>
                                    )}
                                </div>
                            </div>

                        ))}
                    </div>

                    <button
                        className="btn-cancelar-venda"
                        onClick={() => cancelarVenda(venda.venda_numero)}
                    >
                        Cancelar venda
                    </button>

                </div>
            ))}
        </main>
    );
}
