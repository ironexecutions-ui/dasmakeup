import React, { useEffect, useState } from "react";
import "./frete.css";
import { API_URL } from "../../../config";

export default function Frete({
    preco,
    quantidade,
    usuario,
    produtoId,
    setCalculandoFrete
}) {

    const [frete, setFrete] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);

    const [local, setLocal] = useState("");
    const [dataReceber, setDataReceber] = useState("");

    const [endereco, setEndereco] = useState(null);
    const [loadingFrete, setLoadingFrete] = useState(false);
    const [freteFinal, setFreteFinal] = useState(0);

    /* ===============================
       CALCULAR SUBTOTAL E TOTAL
    =============================== */
    const TAXA_POR_10 = 1.5;

    useEffect(() => {
        const novoSubtotal = Number(preco) * quantidade;

        const freteBase = Number(frete || 0);
        const adicional =
            freteBase > 0
                ? Math.max(1, Math.floor(freteBase / 10)) * TAXA_POR_10
                : 0;

        const freteCalculado = freteBase + adicional;

        setSubtotal(novoSubtotal);
        setFreteFinal(freteCalculado);
        setTotal(novoSubtotal + freteCalculado);
    }, [preco, quantidade, frete]);


    useEffect(() => {
        setCalculandoFrete?.(loadingFrete);
    }, [loadingFrete, setCalculandoFrete]);


    /* ===============================
       CARREGAR ENDEREÇO DO USUÁRIO
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
            }
        }

        carregarEndereco();
    }, [usuario]);
    const cep = endereco?.cep || null;

    /* ===============================
       CALCULAR FRETE REAL
    =============================== */
    useEffect(() => {
        if (local !== "0") {
            setFrete(0);
            return;
        }

        if (!produtoId) return;
        if (!cep) return;
        if (loadingFrete) return;

        calcularFrete();
    }, [local, quantidade, cep, produtoId]);


    async function calcularFrete() {
        if (loadingFrete) return;

        setLoadingFrete(true);

        try {
            const resp = await fetch(`${API_URL}/das/frete/calcular`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    produto_id: produtoId,
                    quantidade,
                    cep
                })
            });

            const json = await resp.json();

            if (json.ok) {
                setFrete(Number(json.frete));
            } else {
                setFrete(0);
            }
        } finally {
            setLoadingFrete(false);
        }
    }


    /* ===============================
       UTILITÁRIOS
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
                <strong>
                    {loadingFrete
                        ? "Calculando..."
                        : `R$ ${freteFinal.toFixed(2)}`
                    }
                </strong>


            </div>

            <div className="frete-linha total">
                <span>Total</span>
                <strong>R$ {total.toFixed(2)}</strong>
            </div>

            <div className="frete-entrega">
                <label>Onde deseja receber o produto?</label>

                <select
                    value={local}
                    onChange={e => setLocal(e.target.value)}
                >
                    <option value="" disabled>
                        Selecione uma opção
                    </option>

                    <option value="0" disabled={!enderecoValido()}>
                        {enderecoValido()
                            ? enderecoFormatado()
                            : "Seu endereço (cadastre um endereço)"}
                    </option>

                    <option value="1">Centro de Treinamento Missionário</option>
                    <option value="2">Loja Dass, do lado do CTM</option>
                </select>
            </div>

            {(local === "1" || local === "2") && (
                <div className="frete-data">
                    <label>Data para receber</label>
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
