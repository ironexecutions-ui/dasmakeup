import React from "react";
import "./modalproduto.css";
import { API_URL } from "../../../config";
import ModalLogin from "../modals/modallogin";


export default function ModalProduto({ produto, fechar }) {

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const estaLogado = !!usuario.id;

    const [quantos, setQuantos] = React.useState(1);
    const [loadingQuantos, setLoadingQuantos] = React.useState(true);
    const [calculandoFrete, setCalculandoFrete] = React.useState(false);
    const [opcaoSelecionada, setOpcaoSelecionada] = React.useState("");
    const [abrirLogin, setAbrirLogin] = React.useState(false);
    const [imagemAberta, setImagemAberta] = React.useState(null);


    // Carregar quantidade real do banco quando abrir o modal
    React.useEffect(() => {
        async function carregar() {
            const resp = await fetch(`${API_URL}/das/processo/historico`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    produto_id: produto.id
                })
            });

            // Agora buscar a quantidade
            const r = await fetch(`${API_URL}/das/processo/get`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    produto_id: produto.id
                })
            });

            const json = await r.json();
            if (json.quantos) setQuantos(json.quantos);
            setLoadingQuantos(false);
        }

        carregar();
    }, []);

    React.useEffect(() => {
        // trava o scroll da página principal
        document.body.classList.add("modal-aberto");

        return () => {
            // libera o scroll ao fechar o modal
            document.body.classList.remove("modal-aberto");
        };
    }, []);

    // Enviar quantidade ao backend
    async function salvarQuantidade(novoValor) {
        setQuantos(novoValor);

        await fetch(`${API_URL}/das/processo/quantos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario_id: usuario.id,
                produto_id: produto.id,
                quantos: novoValor
            })
        });
    }


    // Botões de alteração
    function aumentar() {
        salvarQuantidade(quantos + 1);
    }

    function diminuir() {
        if (quantos > 1) salvarQuantidade(quantos - 1);
    }

    function aumentar5() {
        salvarQuantidade(quantos + 5);
    }


    async function enviarHistorico() {
        if (!usuario.id) return;

        await fetch(`${API_URL}/das/processo/historico`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario_id: usuario.id,
                produto_id: produto.id
            })
        });
    }

    async function adicionarCarrinho() {
        if (!usuario.id) return;

        animarCarta();

        const resp = await fetch(`${API_URL}/das/processo/carrinho`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario_id: usuario.id,
                produto_id: produto.id
            })
        });

        const json = await resp.json();

        if (!json.ok) {
            console.warn(json.msg);
        }
    }

    function animarCarta() {
        const carta = document.createElement("div");
        carta.className = "carta-animada";
        carta.innerText = "✓";

        // posição inicial no centro do modal
        carta.style.left = "50%";
        carta.style.top = "50%";
        carta.style.transform = "translate(-50%, -50%)";

        document.body.appendChild(carta);

        setTimeout(() => {
            carta.remove();
        }, 800);
    }

    async function marcarComprado() {
        if (!usuario.id) return;

        await fetch(`${API_URL}/das/processo/comprado`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario_id: usuario.id,
                produto_id: produto.id
            })
        });
    }
    async function comprarAgora() {

        // NÃO está logado
        if (!usuario.id) {

            // salva intenção de compra
            localStorage.setItem("compra_pendente", JSON.stringify({
                produto_id: produto.id,
                quantidade: quantos,
                opcao: opcaoSelecionada
            }));

            setAbrirLogin(true);
            return;
        }

        // fluxo normal quando está logado
        const resp = await fetch(`${API_URL}/das/processo/comprar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                produto_id: produto.id,
                quantidade: quantos
            })
        });

        const json = await resp.json();

        if (json.link_pagamento) {
            window.location.href = json.link_pagamento;
        }
    }



    // Envia histórico assim que abrir o modal
    React.useEffect(() => {
        enviarHistorico();
    }, []);

    const imagens = [
        produto.imagem_um,
        produto.imagem_dois,
        produto.imagem_tres,
        produto.imagem_quatro
    ].filter(img => img);

    const caracteristicas = produto.caracteristicas
        ? produto.caracteristicas.split(";").map(c => c.trim()).filter(Boolean)
        : [];

    return (
        <div className="modal-overlay" onClick={fechar}>
            <div className="modal-produto" onClick={e => e.stopPropagation()}>

                <button className="btn-ffechar" onClick={fechar}>
                    fechar
                </button>
                <br />
                <div className="modal-imagens">
                    {imagens.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            className="imagem-item"
                            onClick={() => setImagemAberta(img)}
                        />
                    ))}
                </div>


                <h2 className="modal-nome">{produto.produto}</h2>
                {estaLogado && (
                    <>
                        {loadingQuantos ? (
                            <div className="quantidade-loading">
                                <div className="loader-line"></div>
                            </div>
                        ) : (
                            <div className="quantidade-box">

                                <h3>Quantidade</h3>

                                <div className="quantidade-controle">
                                    <button onClick={diminuir} className="q-btn">−</button>
                                    <div className="quantidade-numero">{quantos}</div>
                                    <button onClick={aumentar} className="q-btn">+</button>
                                    <button onClick={aumentar5} className="q-btn">+5</button>
                                </div>



                            </div>
                        )}
                    </>
                )}

                <p className="modal-preco">R$ <strong style={{ fontSize: "1.5rem" }}> {Number(produto.preco).toFixed(2)} </strong>  por unidade </p>

                <p className="modal-desc">{produto.descricao}</p>


                {!estaLogado && (
                    <p className="msg-login-info">
                        Ao clicar em <strong>Comprar</strong>, você será direcionado para o login.
                        Após entrar, o produto <strong>{produto.produto}</strong> ficará salvo no seu carrinho.
                    </p>
                )}
                {caracteristicas.length > 0 && (
                    <div className="modal-categorias">

                        <p className="texto-categoria">
                            Este produto está disponível nas seguintes variações:
                        </p>

                        <ul className="lista-caracteristicas">
                            {caracteristicas.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                    </div>
                )}


                <div className="modal-botoes">

                    {!estaLogado && (
                        <button
                            className="btn-comprar"
                            onClick={comprarAgora}
                            disabled={
                                loadingQuantos ||
                                calculandoFrete ||
                                !produto.id
                            }
                        >
                            Fazer login para comprar
                        </button>
                    )}

                    {estaLogado && (
                        <button
                            className="btn-carrinho"
                            onClick={adicionarCarrinho}
                            disabled={loadingQuantos}
                        >
                            Adicionar ao carrinho
                        </button>
                    )}

                </div>


            </div>
            {abrirLogin && (
                <ModalLogin fechar={() => setAbrirLogin(false)} />
            )}
            {imagemAberta && (
                <div className="imagem-overlay" onClick={() => setImagemAberta(null)}>
                    <img
                        src={imagemAberta}
                        className="imagem-ampliada"
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        className="fechar-imagem"
                        onClick={(e) => {
                            e.stopPropagation();
                            setImagemAberta(null);
                        }}
                    >
                        ✕
                    </button>

                </div>
            )}

        </div>
    );
}
