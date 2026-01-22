import React, { useState } from "react";
import "./produtoentregue.css";
import { API_URL } from "../../../config";

export default function ModalProdutoEntregue({ produto, fechar }) {

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    const [estrelas, setEstrelas] = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando] = useState(false);

    const imagens = [
        produto.imagem_um,
        produto.imagem_dois,
        produto.imagem_tres,
        produto.imagem_quatro
    ].filter(img => img);

    async function enviarAvaliacao() {
        if (
            produto.produto_id == null ||
            usuario.id == null ||
            estrelas < 1
        ) {
            alert("Dados inválidos para avaliação");
            return;
        }

        setEnviando(true);

        const resp = await fetch(`${API_URL}/das/api/avaliacoes/enviar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                produto_id: produto.produto_id,
                usuario_id: usuario.id,
                estrelas: estrelas,
                comentario: comentario.trim() || null
            })
        });

        setEnviando(false);

        if (resp.ok) {
            alert("Avaliação enviada com sucesso");
            fechar();
        } else {
            const erro = await resp.json();
            alert(JSON.stringify(erro));
        }
    }


    return (
        <div className="ww-produto-box">

            <button className="ww-btn-fechar" onClick={fechar}>
                fechar
            </button>

            <div className="ww-imagens">
                {imagens.map((img, i) => (
                    <img key={i} src={img} className="ww-imagem-item" />
                ))}
            </div>

            <h2 className="ww-nome">{produto.produto}</h2>

            <p className="ww-preco">
                R$ {Number(produto.preco).toFixed(2)}
            </p>

            <div className="ww-avaliacao-box">
                <p className="ww-avaliacao-titulo">Avalie este produto</p>

                <div className="ww-estrelas">
                    {[1, 2, 3, 4, 5].map(n => (
                        <span
                            key={n}
                            onClick={() => setEstrelas(n)}
                            className={n <= estrelas ? "ww-estrela ww-ativa" : "ww-estrela"}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea
                    className="ww-textarea"
                    placeholder="Escreva um comentário (opcional)"
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    rows={4}
                />

                <button
                    className="ww-btn-enviar"
                    disabled={enviando || estrelas === 0}
                    onClick={enviarAvaliacao}
                >
                    Enviar avaliação
                </button>
            </div>

        </div>
    );
}
