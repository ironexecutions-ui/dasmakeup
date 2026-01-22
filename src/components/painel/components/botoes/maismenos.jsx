import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./maismenos.css";

export default function MaisMenos() {

    const hoje = new Date();
    const tresDiasAntes = new Date(hoje);
    tresDiasAntes.setDate(hoje.getDate() - 3);

    const [dataInicio, setDataInicio] = useState(
        tresDiasAntes.toISOString().split("T")[0]
    );

    const [limite, setLimite] = useState(5);
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(false);

    async function carregar() {
        setLoading(true);

        const resp = await fetch(`${API_URL}/das/grafico/mais-menos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data_inicio: dataInicio,
                limite: limite
            })
        });

        const json = await resp.json();
        if (json.ok) setDados(json);

        setLoading(false);
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <main className="mm-painel">

            <h2 className="mm-titulo">Mais e Menos Vendidos</h2>

            <div className="mm-filtros">
                <div>
                    <label>Data inicial</label>
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={e => setDataInicio(e.target.value)}
                    />
                </div>

                <div>
                    <label>Quantidade</label>
                    <input
                        type="number"
                        min="1"
                        value={limite}
                        onChange={e => setLimite(Number(e.target.value))}
                    />
                </div>

                <button onClick={carregar}>
                    Atualizar
                </button>
            </div>

            {loading && <p className="mm-loading">Carregando...</p>}

            {dados && (
                <div className="mm-listas">

                    <div className="mm-bloco mm-bloco-mais">
                        <h3>Mais vendidos</h3>

                        {dados.mais.map((p, i) => (
                            <div key={p.id} className="mm-item">
                                <strong>{i + 1}. {p.produto}</strong>
                                <span>{p.total_vendido} unidades</span>
                                <span>R$ {Number(p.total_faturado).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mm-bloco mm-bloco-menos">
                        <h3>Menos vendidos</h3>

                        {dados.menos.map((p, i) => (
                            <div key={p.id} className="mm-item">
                                <strong>{i + 1}. {p.produto}</strong>
                                <span>{p.total_vendido} unidades</span>
                                <span>R$ {Number(p.total_faturado).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                </div>
            )}

        </main>
    );
}
