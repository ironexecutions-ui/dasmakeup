import React from "react";
import "./produtomodal.css";

export default function ProdutoModal({ produto, fechar }) {

    const imagens = [
        produto.imagem_um,
        produto.imagem_dois,
        produto.imagem_tres,
        produto.imagem_quatro
    ].filter(Boolean);

    return (
        <div className="pm-overlay" onClick={fechar}>
            <div className="pm-box" onClick={e => e.stopPropagation()}>

                <button className="pm-fechar" onClick={fechar}>×</button>

                <div className="pm-imgs">
                    {imagens.map((img, i) => (
                        <img key={i} src={img} className="pm-img" />
                    ))}
                </div>

                <h2 className="pm-nome">{produto.produto}</h2>

                <p className="pm-desc">{produto.descricao}</p>

                <ul className="pm-caracts">
                    {produto.caracteristicas.split(";").map((c, i) => (
                        <li key={i}>{c}</li>
                    ))}
                </ul>

                <p className="pm-total">
                    Total pago: <strong>R$ {(produto.preco * produto.quantos).toFixed(2)}</strong>
                </p>
            </div>
        </div>
    );
}
