import React from "react";
import "./produtoscard.css";

export default function ProdutoCard({ produto, abrirModalProduto }) {

    function imagemValida(img) {
        if (!img) return false;

        const v = String(img).toLowerCase().trim();

        if (
            v === "pin" ||
            v === "null" ||
            v === "undefined" ||
            v === "0"
        ) return false;

        return v.startsWith("http://") || v.startsWith("https://");
    }

    const temImagem = imagemValida(produto.imagem_um);

    return (
        <div
            className="produto-card"
            onClick={() => abrirModalProduto(produto)}
        >
            {temImagem && (
                <img
                    src={produto.imagem_um}
                    alt={produto.produto}
                    className="produto-img"
                />
            )}

            <div className="produto-info">
                <h3 className="produto-nome">{produto.produto}</h3>
                <p className="produto-preco">
                    R$ {Number(produto.preco).toFixed(2)}
                </p>
            </div>
        </div>
    );
}
