import React, { useEffect, useState } from "react";
import "./frete.css";
import { API_URL } from "../../../config";

export default function FreteCarrinho({
    subtotal,
    frete,
    total,
    usuario
}) {

    const [local, setLocal] = useState("");
    const [dataReceber, setDataReceber] = useState("");
    const [endereco, setEndereco] = useState(null);

    /* ===============================
       CARREGAR ENDEREÇO
    =============================== */
    useEffect(() => {
        async function carregarEndereco() {
            if (!usuario?.id) return;

            const r = await fetch(`${API_URL}/das/usuario/endereco`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: usuario.id })
            });

            const json = await r.json();
            if (json.ok) {
                setEndereco(json.endereco);
                setLocal("0"); // endereço padrão
            }
        }

        carregarEndereco();
    }, [usuario]);

    /* ===============================
       UTIL
    =============================== */
    function enderecoValido() {
        if (!endereco) return false;
        return endereco.cep && endereco.rua && endereco.numero && endereco.cidade && endereco.estado;
    }

    function enderecoFormatado() {
        if (!endereco) return "";
        return `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} • CEP ${endereco.cep}`;
    }

    /* ===============================
       RENDER
    =============================== */
    return (
        <div className="frete-box">

            <div className="frete-linha">
                <span>Subtotal</span>
                <strong>R$ {subtotal.toFixed(2)}</strong>
            </div>

            <div className="frete-linha">
                <span>Valor de entrega</span>
                <strong>R$ {frete.toFixed(2)}</strong>
            </div>

            <div className="frete-linha total">
                <span>Total</span>
                <strong>R$ {total.toFixed(2)}</strong>
            </div>

            <div className="frete-entrega">
                <label>Onde deseja receber?</label>

                <select value={local} onChange={e => setLocal(e.target.value)}>
                    <option value="0" disabled={!enderecoValido()}>
                        {enderecoValido()
                            ? enderecoFormatado()
                            : "Cadastre um endereço"}
                    </option>

                    <option value="1">Centro de Treinamento Missionário</option>
                    <option value="2">Loja Dass</option>
                </select>
            </div>

            {(local === "1" || local === "2") && (
                <div className="frete-data">
                    <label>Data para retirada</label>
                    <input
                        type="date"
                        value={dataReceber}
                        onChange={e => setDataReceber(e.target.value)}
                    />
                </div>
            )}

        </div>
    );
}
