import React, { useState } from "react";
import { API_URL } from "../../../config";
import "./modalfiltro.css";

export default function ModalFiltro({ fechar, setProdutos }) {

    const [nome, setNome] = useState("");
    const [categoria, setCategoria] = useState("");
    const [min, setMin] = useState("");
    const [max, setMax] = useState("");

    async function buscar() {
        const body = { nome, categoria, min, max };

        const resp = await fetch(`${API_URL}/das/produtos/filtrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const json = await resp.json();
        setProdutos(json.produtos || []);
        fechar();
    }

    return (
        <div className="modal-overlay" onClick={fechar}>
            <div className="modal-filtro" onClick={e => e.stopPropagation()}>

                <h2>Filtrar produtos</h2>

                <input
                    placeholder="Nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                />

                <input
                    placeholder="Categoria"
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                />

                <input
                    placeholder="Preço mínimo"
                    value={min}
                    onChange={e => setMin(e.target.value)}
                />

                <input
                    placeholder="Preço máximo"
                    value={max}
                    onChange={e => setMax(e.target.value)}
                />

                <button className="btnn-buscar" onClick={buscar}>
                    Buscar
                </button>

            </div>
        </div>
    );
}
