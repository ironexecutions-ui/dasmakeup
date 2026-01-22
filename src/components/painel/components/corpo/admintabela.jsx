import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./admintabela.css";

export default function AdminTabela({ tipo = "admin" }) {

    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [limite, setLimite] = useState(25);

    useEffect(() => {
        carregar();
    }, [tipo]);

    useEffect(() => {
        setLimite(25);
    }, [filtro]);

    async function carregar() {
        const resp = await fetch(`${API_URL}/das/admin/usuarios/?tipo=${tipo}`);
        const json = await resp.json();
        setUsuarios(json.usuarios || []);
        setLimite(25);
    }

    async function trocarFuncao(id, novaFuncao) {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Token não encontrado. Faça login novamente.");
            return;
        }

        const resp = await fetch(`${API_URL}/das/admin/usuarios/funcao`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id, funcao: novaFuncao })
        });

        if (!resp.ok) {
            const erro = await resp.json();
            alert(erro.detail || "Erro ao alterar função");
            return;
        }

        carregar();
    }


    async function apagar(id) {
        if (!window.confirm("Tem certeza que deseja apagar este usuário?")) return;

        await fetch(`${API_URL}/das/admin/usuarios/admin/${id}`, {
            method: "DELETE"
        });

        carregar();
    }

    const usuariosFiltrados = usuarios.filter(user => {
        const nomeCompleto = `${user.nome} ${user.sobrenome}`.toLowerCase();
        return nomeCompleto.includes(filtro.toLowerCase());
    });

    const usuariosVisiveis = usuariosFiltrados.slice(0, limite);

    return (
        <main className="corpo-painel">

            <h2>
                {tipo === "admin" ? "Administradores" : "Clientes"}
            </h2>

            {/* FILTRO */}
            <div className="adm-filtro">
                <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
                />
            </div>

            <div className="adm-table-container">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>WhatsApp</th>
                            <th>Endereço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {usuariosVisiveis.map(user => (
                            <tr
                                key={user.id}
                                className={user.termos !== 1 ? "linha-vermelha" : ""}
                            >
                                <td>{user.nome} {user.sobrenome}</td>
                                <td>{user.email}</td>
                                <td>{user.whatsapp || "-"}</td>

                                <td>
                                    {user.rua}, {user.numero} - {user.bairro}<br />
                                    {user.cidade}/{user.estado} — CEP {user.cep}
                                </td>

                                <td>
                                    {user.funcao === "admin" ? (
                                        <button
                                            className="btn-mudar"
                                            onClick={() => trocarFuncao(user.id, "cliente")}
                                        >
                                            Mover para Cliente
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-mudar"
                                            onClick={() => trocarFuncao(user.id, "admin")}
                                        >
                                            Tornar Admin
                                        </button>
                                    )}

                                    <button
                                        className="btn-apagar"
                                        onClick={() => apagar(user.id)}
                                    >
                                        Apagar
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {usuariosVisiveis.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px", opacity: 0.6 }}>
                                    Nenhum usuário encontrado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* BOTÃO CARREGAR MAIS */}
            {limite < usuariosFiltrados.length && (
                <div className="adm-carregar-mais">
                    <button onClick={() => setLimite(limite + 25)}>
                        Carregar mais
                    </button>
                </div>
            )}

        </main>
    );
}
