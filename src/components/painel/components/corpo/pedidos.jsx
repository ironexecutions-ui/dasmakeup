import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./pedidos.css";

export default function Pedidos() {

    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            const resp = await fetch(`${API_URL}/das/pedidos`);
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
                <p>Carregando pedidos...</p>
            </main>
        );
    }

    return (
        <main className="corpo-painel">
            <h2>Pedidos</h2>

            {vendas.length === 0 && (
                <p>Nenhum pedido encontrado.</p>
            )}

            {vendas
                .filter(venda => venda.venda_numero !== 0)
                .map(venda => (
                    <div key={venda.venda_numero} className="pedido-card">

                        <div className="pedido-topo">
                            <h3>Venda #{venda.venda_numero}</h3>
                            <span className="pedido-data">
                                {new Date(venda.data).toLocaleDateString("pt-BR")}
                            </span>
                        </div>

                        <div className="cliente-info">
                            <p><strong>Cliente:</strong> {venda.cliente.nome} {venda.cliente.sobrenome}</p>
                            <p><strong>WhatsApp:</strong> {venda.cliente.whatsapp}</p>
                            <p><strong>Email:</strong> {venda.cliente.email}</p>
                        </div>

                        <div className="produtos-pedido">
                            {venda.produtos.map((p, i) => (
                                <div key={i} className="produto-item">
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
