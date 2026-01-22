import React, { useState, useEffect } from "react";
import { API_URL } from "../../../config";
import "./modalperfil.css";

const estadosUF = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function ModalPerfil({ fechar }) {

    const [usuario, setUsuario] = useState(null);

    const [editNome, setEditNome] = useState(false);
    const [editWhats, setEditWhats] = useState(false);
    const [editEndereco, setEditEndereco] = useState(false);
    const [editSobrenome, setEditSobrenome] = useState(false);

    const [form, setForm] = useState({
        nome: "",
        sobrenome: "",
        whatsapp: "",
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        tipo_residencia: ""
    });

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("usuario"));
        if (u) {
            setUsuario(u);
            setForm(prev => ({
                ...prev,
                nome: u.nome || "",
                sobrenome: u.sobrenome || "",
                whatsapp: u.whatsapp || "",
                cep: u.cep || "",
                rua: u.rua || "",
                numero: u.numero || "",
                bairro: u.bairro || "",
                cidade: u.cidade || "",
                estado: u.estado || "",
                tipo_residencia: u.tipo_residencia || ""
            }));
        }

        document.body.classList.add("modal-aberto");
        return () => document.body.classList.remove("modal-aberto");
    }, []);

    async function salvarCampo(campo) {
        const resp = await fetch(`${API_URL}/das/usuario/atualizar-info`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: usuario.email,
                campo,
                valor: form[campo]
            })
        });

        const json = await resp.json();

        if (json.ok) {
            const atualizado = { ...usuario, [campo]: form[campo] };
            localStorage.setItem("usuario", JSON.stringify(atualizado));
            setUsuario(atualizado);
            setEditNome(false);
            setEditWhats(false);
        }
    }

    async function salvarEndereco() {
        const resp = await fetch(`${API_URL}/das/usuario/atualizar-endereco`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: usuario.email, ...form })
        });

        const json = await resp.json();

        if (json.ok) {
            const atualizado = { ...usuario, ...form };
            localStorage.setItem("usuario", JSON.stringify(atualizado));
            fechar();
            window.location.reload();
        }
    }

    const [confirmarLogout, setConfirmarLogout] = useState(false);

    function logout() {
        if (!confirmarLogout) {
            setConfirmarLogout(true);
            setTimeout(() => setConfirmarLogout(false), 2000);
            return;
        }

        localStorage.removeItem("usuario");
        fechar();
        window.location.href = "/";
    }

    return (
        <div className="mp-overlay" onClick={fechar}>
            <div className="mp-box" onClick={e => e.stopPropagation()}>

                <h2 className="mp-titulo">Seu perfil</h2>
                <button className="mp-btn-fechar" onClick={fechar}>X</button>

                <div className="mp-campo-linha">
                    <strong>Nome:</strong>
                    {!editNome ? (
                        <>
                            <span>{form.nome}</span>
                            <button className="mp-editar" onClick={() => setEditNome(true)}>Editar</button>
                        </>
                    ) : (
                        <>
                            <input
                                value={form.nome}
                                onChange={e => setForm({ ...form, nome: e.target.value })}
                            />
                            <button className="mp-salvar" onClick={() => salvarCampo("nome")}>Salvar</button>
                        </>
                    )}
                </div>
                <div className="mp-campo-linha">
                    <strong>Sobrenome:</strong>

                    {!editSobrenome ? (
                        <>
                            <span>{form.sobrenome}</span>
                            <button
                                className="mp-editar"
                                onClick={() => setEditSobrenome(true)}
                            >
                                Editar
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                value={form.sobrenome}
                                onChange={e =>
                                    setForm({ ...form, sobrenome: e.target.value })
                                }
                            />
                            <button
                                className="mp-salvar"
                                onClick={() => salvarCampo("sobrenome")}
                            >
                                Salvar
                            </button>
                        </>
                    )}
                </div>

                <div className="mp-campo-linha">
                    <strong>WhatsApp:</strong>
                    {!editWhats ? (
                        <>
                            <span>{form.whatsapp}</span>
                            <button className="mp-editar" onClick={() => setEditWhats(true)}>Editar</button>
                        </>
                    ) : (
                        <>
                            <input
                                value={form.whatsapp}
                                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                placeholder="11999998888"
                            />
                            <button className="mp-salvar" onClick={() => salvarCampo("whatsapp")}>Salvar</button>
                        </>
                    )}
                </div>

                {usuario?.funcao === "admin" && (
                    <button
                        className="mp-btn-painel"
                        onClick={() => {
                            localStorage.setItem("painel_autorizado", "sim");
                            window.location.href = "/painel";
                        }}
                    >
                        Painel de controle
                    </button>
                )}

                <button className="mp-btn-endereco" onClick={() => setEditEndereco(!editEndereco)}>
                    Editar endereço
                </button>

                {editEndereco && (
                    <div className="mp-endereco-form">
                        <label>CEP</label>
                        <input
                            value={form.cep}
                            onChange={e => setForm({ ...form, cep: e.target.value })}
                        />

                        <label>Rua</label>
                        <input
                            value={form.rua}
                            onChange={e => setForm({ ...form, rua: e.target.value })}
                        />

                        <label>Número</label>
                        <input
                            value={form.numero}
                            onChange={e => setForm({ ...form, numero: e.target.value })}
                        />

                        <label>Bairro</label>
                        <input
                            value={form.bairro}
                            onChange={e => setForm({ ...form, bairro: e.target.value })}
                        />

                        <label>Cidade</label>
                        <input
                            value={form.cidade}
                            onChange={e => setForm({ ...form, cidade: e.target.value })}
                        />

                        <label>Estado</label>
                        <input
                            list="ufs"
                            value={form.estado}
                            onChange={e => setForm({ ...form, estado: e.target.value })}
                        />
                        <datalist id="ufs">
                            {estadosUF.map(uf => <option key={uf} value={uf} />)}
                        </datalist>

                        <label>Tipo de residência</label>
                        <select
                            value={form.tipo_residencia}
                            onChange={e => setForm({ ...form, tipo_residencia: e.target.value })}
                        >
                            <option value="">Selecione</option>
                            <option value="casa">Casa</option>
                            <option value="apartamento">Apartamento</option>
                            <option value="condominio">Condomínio</option>
                        </select>

                        <button className="mp-salvar" onClick={salvarEndereco}>
                            Salvar endereço
                        </button>
                    </div>
                )}

                <button className="mp-btn-logout" onClick={logout}>
                    {confirmarLogout ? "Clique novamente para confirmar" : "Sair da conta"}
                </button>

            </div>
        </div>
    );
}
