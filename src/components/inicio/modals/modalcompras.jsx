import React, { useEffect, useState } from "react";
import "./modalcompras.css";
import { API_URL } from "../../../config";
import ProdutoModal from "./produtomodal";
import ModalProdutoEntregue from "./produtoentregue";

export default function ModalCompras({ fechar }) {
    const [avaliacoes, setAvaliacoes] = useState([]);

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const [produtoEntregueModal, setProdutoEntregueModal] = useState(null);
    const [avaliandoProdutoId, setAvaliandoProdutoId] = useState(null);

    const [carregandoInicial, setCarregandoInicial] = useState(true);
    const [pedidos, setPedidos] = useState([]);
    const [entregues, setEntregues] = useState([]);
    const [produtoModal, setProdutoModal] = useState(null);
    useEffect(() => {
        if (!entregues.length || !avaliacoes.length) return;

        for (const entrega of entregues) {
            if (!entrega.itens) continue;

            for (const item of entrega.itens) {
                const jaAvaliado = avaliacoes.find(
                    a => a.produto_id === item.produto_id
                );

                if (!jaAvaliado) {
                    setAvaliandoProdutoId(item.produto_id);
                    return; // abre apenas o primeiro não avaliado
                }
            }
        }
    }, [entregues, avaliacoes]);

    // -----------------------------
    // Função única e oficial
    // -----------------------------
    async function carregarPedidos(primeiraVez = false) {

        if (primeiraVez) {
            setCarregandoInicial(true);
        }

        try {
            const resp = await fetch(`${API_URL}/das/api/compras/listar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: usuario.id })
            });

            const json = await resp.json();

            setPedidos(json.pedidos || []);
            setEntregues(json.entregues || []);
        } catch (e) {
            console.log("Erro ao carregar pedidos", e);
        } finally {
            if (primeiraVez) {
                setCarregandoInicial(false);
            }
        }
    }
    useEffect(() => {
        carregarPedidos(true);

        async function carregarAvaliacoes() {
            try {
                const resp = await fetch(
                    `${API_URL}/api/avaliacoes/usuario/${usuario.id}`
                );
                const json = await resp.json();
                setAvaliacoes(Array.isArray(json) ? json : []);

            } catch (e) {
                console.log("Erro ao carregar avaliações", e);
            }
        }

        carregarAvaliacoes();
    }, []);
    function avaliacaoDoProduto(produtoId) {
        return avaliacoes.find(a => a.produto_id === produtoId);
    }

    // Carrega somente 1 vez com loading
    useEffect(() => {
        carregarPedidos(true);
    }, []);

    // Atualiza automaticamente sem loading
    useEffect(() => {
        carregarPedidos(true);
    }, []);


    // Confirmar chegada
    async function confirmarChegada(venda_numero) {
        await fetch(`${API_URL}/das/api/compras/chegou`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ venda_numero })
        });

        carregarPedidos(false);
    }

    // Barra de progresso
    function Progresso({ pedido }) {

        // Determinar etapa
        let etapa = 1;
        if (pedido.confirmando === 1) etapa = 2;
        if (pedido.recebido === 1) etapa = 3;
        if (pedido.chegou === 1) etapa = 4;

        const textos = {
            1: "Pedido recebido e em preparação",
            2: "Enviado à transportadora, aguardando coleta",
            3: "Pedido em rota de entrega",
            4: "Pedido entregue ao destinatário"
        };

        return (
            <div style={{ marginBottom: "20px" }}>
                <div className="progress-box">
                    {[1, 2, 3, 4].map((n, index) => (
                        <div key={index} className="progress-item">

                            <div className={`progress-dot ${etapa >= n ? "ativo" : ""}`}></div>

                            {index < 3 && (
                                <div
                                    className={`progress-line ${etapa > n
                                        ? "ativa"
                                        : etapa === n
                                            ? "animando"
                                            : ""
                                        }`}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>

                <p className="progress-text">{textos[etapa]}</p>
            </div>
        );
    }
    function diasDesdeEntrega(dataEntrega) {
        const hoje = new Date();
        const data = new Date(dataEntrega);

        const diff = hoje.getTime() - data.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    function cancelarPedido(numero) {
        const telefone = "5511994381409"; // sem espaços, sem +, sem caracteres especiais

        const mensagem = `ola, gostaria de cancelar o pedido do protocolo # ${numero}`;

        const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, "_blank");
    }


    return (
        <div className="compras-container">
            <h2 className="titulo-geral">Seus pedidos</h2>

            {/* LOADING PROFISSIONAL (somente 1 vez) */}
            {carregandoInicial ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando seus pedidos...</p>
                </div>
            ) : (
                <>
                    {pedidos.length === 0 && (
                        <p className="nenhum-pedido">Sem pedidos em processo de entrega</p>
                    )}

                    {pedidos.map((pedido, i) => (
                        <div key={i} className="pedido-card">

                            <Progresso pedido={pedido} />

                            <div className="pedido-info">
                                {pedido.recebido === 1 && pedido.chegou === 0 && (
                                    <div className="rast-box">
                                        <p>
                                            <strong>Rastreamento: </strong>
                                            <a href={pedido.link} target="_blank" rel="noreferrer">
                                                {pedido.link}
                                            </a>
                                        </p>

                                        {pedido.mensagem && (
                                            <p className="rast-msg">{pedido.mensagem}</p>
                                        )}

                                        <button
                                            className="btn-chegou"
                                            style={{ marginTop: "10px" }}
                                            onClick={() => confirmarChegada(pedido.venda_numero)}
                                        >
                                            Recebi o pedido
                                        </button>
                                    </div>
                                )}


                                {pedido.chegaHoje && pedido.chegou === 0 && (
                                    <button
                                        className="btn-chegou"
                                        onClick={() => confirmarChegada(pedido.venda_numero)}
                                    >
                                        Pedido chegou, confirmar
                                    </button>
                                )}
                            </div>

                            <div className="pedido-produtos">
                                {pedido.itens.map((prod, j) => (
                                    <div
                                        key={j}
                                        className="pedido-produto-item"
                                        onClick={() => setProdutoModal(prod)}
                                    >
                                        <img src={prod.imagem_um} className="pedido-img" />

                                        <div>
                                            <p className="pedido-prod-nome">{prod.produto}</p>
                                            <p className="pedido-prod-qt">Quantidade: {prod.quantos}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {entregues.length > 0 && (
                        <>
                            <br />
                            <hr />

                            <h2 className="titulo-entregues">Pedidos entregues</h2>

                            {entregues.map((e, i) => {

                                const dias = diasDesdeEntrega(e.data);

                                return (
                                    <div key={i} className="entregue-item">



                                        <p>
                                            {dias === 0 && (
                                                <> Pedido entregue <strong>hoje</strong></>
                                            )}

                                            {dias === 1 && (
                                                <>Pedido entregue <strong>ontem</strong></>
                                            )}

                                            {dias > 1 && (
                                                <>Pedido entregue faz <strong>{dias} dia(s)</strong></>
                                            )}
                                        </p>


                                        {/* LISTA DOS PRODUTOS ENTREGUES */}
                                        {e.itens && (
                                            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                                                {e.itens.map((p, idx) => {

                                                    const avaliacao = avaliacaoDoProduto(p.produto_id);

                                                    return (
                                                        <div key={idx} style={{ marginBottom: "10px" }}>
                                                            <p style={{ fontSize: "14px" }}>
                                                                • {p.produto}
                                                            </p>

                                                            {/* JÁ AVALIADO */}
                                                            {avaliacao ? (
                                                                <div className="ww-avaliacao-existente">

                                                                    <div className="ww-estrelas">
                                                                        {[1, 2, 3, 4, 5].map(n => (
                                                                            <span
                                                                                key={n}
                                                                                className={
                                                                                    n <= avaliacao.estrelas
                                                                                        ? "ww-estrela ww-ativa"
                                                                                        : "ww-estrela"
                                                                                }
                                                                            >
                                                                                ★
                                                                            </span>
                                                                        ))}
                                                                    </div>

                                                                    {avaliacao.comentario && (
                                                                        <p className="ww-comentario">
                                                                            “{avaliacao.comentario}”
                                                                        </p>
                                                                    )}

                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {avaliandoProdutoId === p.produto_id ? (
                                                                        <ModalProdutoEntregue
                                                                            produto={p}
                                                                            fechar={() => setAvaliandoProdutoId(null)}
                                                                        />
                                                                    ) : (
                                                                        <button
                                                                            className="btn-avaliar"
                                                                            onClick={() => setAvaliandoProdutoId(p.produto_id)}
                                                                        >
                                                                            Avaliar produto
                                                                        </button>
                                                                    )}

                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                            </div>
                                        )}


                                        {/* BOTÃO DE CANCELAMENTO (menos de 7 dias) */}
                                        {dias < 7 && (
                                            <button
                                                onClick={() => cancelarPedido(e.venda_numero)}
                                                className="bbtn-chegou"
                                                style={{
                                                    marginTop: "10px",
                                                    background: "red",
                                                    border: "none"
                                                }}
                                            >
                                                Cancelar pedido
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                        </>
                    )}
                </>
            )}

            {produtoModal && (
                <ProdutoModal
                    produto={produtoModal}
                    fechar={() => setProdutoModal(null)}
                />
            )}
            {produtoEntregueModal && (
                <ModalProdutoEntregue
                    produto={produtoEntregueModal}
                    fechar={() => setProdutoEntregueModal(null)}
                />
            )}

        </div>
    );
}
