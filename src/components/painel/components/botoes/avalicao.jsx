import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./avalicao.css";

export default function Avaliacao() {

    const [resumo, setResumo] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const [r1, r2, r3] = await Promise.all([
                    fetch(`${API_URL}/das/avaliacoes/resumo`).then(r => r.json()),
                    fetch(`${API_URL}/das/avaliacoes/ranking`).then(r => r.json()),
                    fetch(`${API_URL}/das/avaliacoes/listar`).then(r => r.json()),
                ]);

                setResumo(r1);
                setRanking(r2);
                setAvaliacoes(r3);
            } finally {
                setLoading(false);
            }
        }

        carregar();
    }, []);

    if (loading) return <p style={{ color: "white" }} >Carregando avaliações...</p>;

    return (
        <div className="avaliacao-painel">

            {/* Resumo */}
            <section className="avaliacao-resumo">
                <h2>Resumo geral</h2>
                <p>Total de avaliações: {resumo.total_avaliacoes}</p>
                <p>Média geral: {resumo.media_geral} ⭐</p>
            </section>

            {/* Ranking */}
            <section className="avaliacao-ranking">
                <h2>Produtos melhor avaliados</h2>

                {ranking.map(p => (
                    <div key={p.produto_id} className="ranking-item">
                        <img src={p.imagem_um} alt={p.produto} />
                        <div>
                            <strong>{p.produto}</strong>
                            <p>{p.media} ⭐ ({p.total_avaliacoes} avaliações)</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Avaliações */}
            <section className="avaliacao-lista">
                <h2>Avaliações detalhadas</h2>

                {[...avaliacoes]
                    .sort((a, b) => b.estrelas - a.estrelas)
                    .map(a => (
                        <div key={a.id} className="avaliacao-item">
                            <img src={a.imagem_um} alt={a.produto} />

                            <div>
                                <strong>{a.produto}</strong>

                                <p>
                                    {a.nome}
                                    {a.sobrenome ? ` ${a.sobrenome}` : ""}
                                </p>

                                <div className="estrelas">
                                    {"★".repeat(a.estrelas)}
                                    {"☆".repeat(5 - a.estrelas)}
                                </div>

                                {a.comentario && (
                                    <p className="comentario">{a.comentario}</p>
                                )}
                            </div>
                        </div>
                    ))}
            </section>

            <br />
        </div>
    );
}
