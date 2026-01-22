import React from "react";

export default function QuantidadeControle({
    quantos,
    loading,
    aumentar,
    diminuir,
    aumentar5
}) {
    return (
        <div className="quantidade-controle">

            <button onClick={diminuir} className="q-btn" disabled={loading}>
                −
            </button>

            <div className="quantidade-numero">
                {loading ? "..." : quantos}
            </div>

            <button onClick={aumentar} className="q-btn" disabled={loading}>
                +
            </button>

            <button onClick={aumentar5} className="q-btn" disabled={loading}>
                +5
            </button>

        </div>
    );
}
