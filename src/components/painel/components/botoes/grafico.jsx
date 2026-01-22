import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import './grafico.css'
import { API_URL } from "../../../../config";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

export default function Grafico() {

    const [dados, setDados] = useState(null);

    useEffect(() => {
        async function carregar() {
            const resp = await fetch(`${API_URL}/das/grafico/vendas`);
            const json = await resp.json();
            if (json.ok) setDados(json);
        }
        carregar();
    }, []);

    if (!dados) {
        return (
            <main className="g-painel">
                <h2 className="g-titulo">Gráficos</h2>
                <p className="g-loading">Carregando dados...</p>
            </main>
        );
    }

    function montarGrafico(lista, titulo, tipo) {
        return {
            labels: lista.map(i => {
                if (tipo === "semana") {
                    return formatarPeriodoSemana(i.periodo);
                }
                return i.periodo;
            }),
            datasets: [
                {
                    label: titulo,
                    data: lista.map(i => i.total),
                    borderColor: "#d4af37",
                    backgroundColor: "rgba(212,175,55,0.15)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4
                }
            ]
        };
    }


    const opcoes = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                ticks: {
                    callback: v => `R$ ${Number(v).toFixed(2)}`
                }
            }
        }
    };
    function formatarPeriodoSemana(periodo) {
        const texto = String(periodo);

        if (texto.length === 6) {
            const ano = texto.slice(0, 4);
            const semana = texto.slice(4);
            return `${ano}-${semana}`;
        }

        return periodo;
    }


    return (
        <main className="g-painel">

            <h2 className="g-titulo">Vendas</h2>

            <div className="g-card">
                <h3 className="g-card-titulo">Últimos 7 dias</h3>
                <Line
                    data={montarGrafico(dados.dias, "Vendas por dia")}
                    options={opcoes}
                />
            </div>

            <div className="g-card">
                <h3 className="g-card-titulo">Últimas 7 semanas</h3>
                <Line
                    data={montarGrafico(dados.semanas, "Vendas por semana", "semana")}
                    options={opcoes}
                />
            </div>


            <div className="g-card">
                <h3 className="g-card-titulo">Últimos 7 meses</h3>
                <Line
                    data={montarGrafico(dados.meses, "Vendas por mês")}
                    options={opcoes}
                />
            </div>

        </main>
    );
}
