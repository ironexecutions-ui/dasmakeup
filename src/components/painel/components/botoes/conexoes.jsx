import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./conexoes.css";

export default function Conexoes() {

    const [limite, setLimite] = useState(5);
    const [diarios, setDiarios] = useState([]);
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        carregar();
    }, [limite]);

    async function carregar() {
        const resp = await fetch(`${API_URL}/das/conexoes/metricas?limit=${limite}`);
        const json = await resp.json();

        if (json.ok) {
            const rankingFiltrado = json.ranking.filter(
                u => u.id !== 2
            );

            setDiarios(json.diarios);
            setRanking(rankingFiltrado);
        }
    }


    return (
        <main className="con-corpo-painel">

            <h2 className="con-titulo">Conexões</h2>

            {/* CONTAGEM DIÁRIA */}
            <section className="con-secao">
                <h3 className="con-subtitulo">Conexões por dia</h3>

                <ul className="con-lista-diaria">
                    {diarios.map((d, i) => (
                        <li key={i} className="con-item-diario">
                            {d.dia} , {d.total} conexões
                        </li>
                    ))}
                </ul>
            </section>

            {/* RANKING */}
            <section className="con-secao" style={{ marginTop: "30px" }}>

                <h3 className="con-subtitulo">Usuários mais ativos</h3>

                <label className="con-label">
                    Quantidade de usuários
                    <input
                        className="con-input-numero"
                        type="number"
                        min="1"
                        value={limite}
                        onChange={e => setLimite(e.target.value)}
                    />
                </label>

                <table className="con-tabela">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Conexões</th>
                            <th>WhatsApp</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ranking.map(u => (
                            <tr key={u.id}>
                                <td>{u.nome} {u.sobrenome}</td>
                                <td>{u.total_conexoes}</td>
                                <td>
                                    {u.whatsapp ? (
                                        <a
                                            className="con-whatsapp"
                                            href={`https://wa.me/55${u.whatsapp}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Enviar mensagem
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </section>

        </main>
    );
}
