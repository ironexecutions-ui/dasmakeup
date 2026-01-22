import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./canc.css";

export default function Canceladospainel() {

    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            const resp = await fetch(`${API_URL}/das/cancelados`);
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
            <main className="canc-corpo-painel">
                <p>Carregando pedidos cancelados...</p>
            </main>
        );
    }

    return (
        <main className="canc-corpo-painel">
            <h2>Pedidos Cancelados</h2>

            {vendas.length === 0 && (
                <p>Nenhum pedido cancelado ainda.</p>
            )}

            {vendas.map(venda => (
                <div key={venda.venda_numero} className="canc-card">

                    <div className="canc-topo">
                        <h3>Venda #{venda.venda_numero}</h3>
                    </div>

                    <div className="canc-cliente-info">
                        <p>
                            <strong>Cliente:</strong>{" "}
                            {venda.cliente.nome} {venda.cliente.sobrenome}
                        </p>
                        <p>
                            <strong>WhatsApp:</strong>{" "}
                            {venda.cliente.whatsapp}
                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            {venda.cliente.email}
                        </p>
                    </div>

                    <div className="canc-produtos">
                        {venda.produtos.map((p, i) => (
                            <div key={i} className="canc-produto-item">
                                <img src={p.imagem_um} alt={p.produto} />
                                <span>{p.produto}</span>
                            </div>
                        ))}
                    </div>

                </div>
            ))}
        </main>
    );
}
