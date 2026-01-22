import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../../../config";
import "./entregas.css";

export default function Taxa() {

    const [regiao, setRegiao] = useState("");
    const [valor, setValor] = useState("");
    const [status, setStatus] = useState("sim entrega");
    const [lista, setLista] = useState([]);
    const [erro, setErro] = useState("");
    const [ok, setOk] = useState("");
    const precoRef = useRef(null);

    const token = localStorage.getItem("token");

    async function carregar() {
        try {
            const res = await fetch(`${API_URL}/das/taxa/listar/${token}`);
            const json = await res.json();
            setLista(json);
        } catch {
            setErro("Erro ao carregar taxas");
        }
    }

    async function salvar(e) {
        e.preventDefault();
        setErro("");
        setOk("");

        try {
            const res = await fetch(`${API_URL}/das/taxa/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    regiao,
                    valor: Number(valor),
                    status
                })
            });

            const json = await res.json();

            if (!res.ok) {
                setErro(json.detail || "Erro ao salvar");
                return;
            }

            setOk("Taxa cadastrada com sucesso");
            setRegiao("");
            setValor("");
            setStatus("sim entrega");
            carregar();

        } catch {
            setErro("Erro de conexão");
        }
    }

    useEffect(() => {
        carregar();
    }, []);
    function formatarRegiao(valor) {
        if (!valor) return "";
        return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
    }

    return (
        <div className="taxa-wrapper">

            {/* COLUNA ESQUERDA */}
            <div className="taxa-container">
                <h2>Cadastro de Taxa</h2>

                <form className="taxa-form" onSubmit={salvar}>
                    <input
                        placeholder="Região"
                        value={regiao}
                        onChange={e => setRegiao(formatarRegiao(e.target.value))}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                precoRef.current?.focus();
                            }
                        }}
                        required
                    />


                    <input
                        ref={precoRef}
                        type="number"
                        step="0.01"
                        placeholder="Valor"
                        value={valor}
                        onChange={e => setValor(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.preventDefault();

                                if (regiao && valor) {
                                    salvar(e);
                                }
                            }
                        }}
                        required
                    />


                    <select style={{ display: "none" }}
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="sim entrega">Sim entrega</option>
                        <option value="nao entrega">Não entrega</option>
                    </select>

                    <button type="submit">Salvar</button>
                </form>

                {erro && <p className="taxa-erro">{erro}</p>}
                {ok && <p className="taxa-ok">{ok}</p>}
            </div>

            {/* COLUNA DIREITA */}
            <div className="taxa-lista-lateral">
                <h3>Taxas cadastradas</h3>

                <ul>
                    {lista.map(t => (
                        <li key={t.id}>
                            <div className="linha-regiao">{t.regiao}</div>
                            <div className="linha-info">
                                <span>R$ {Number(t.valor).toFixed(2)}</span>
                                <span style={{ display: "none" }} className={`status ${t.status === "sim entrega" ? "ativo" : "inativo"}`}>
                                    {t.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );

}
