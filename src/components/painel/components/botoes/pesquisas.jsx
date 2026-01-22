import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./pesquisas.css";

export default function Pesquisas() {

    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [usuarios, setUsuarios] = useState([]);
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const resp = await fetch(`${API_URL}/das/pesquisas/carrinho`);
        const json = await resp.json();

        if (json.ok) {
            setTotalUsuarios(json.total_usuarios);
            setUsuarios(json.usuarios);
            setProdutos(json.produtos);
        }
    }

    return (
        <main className="car-corpo-painel">

            <h2 className="car-titulo">Carrinhos</h2>

            <section className="car-secao">
                <h3 className="car-subtitulo">Usuários com carrinho ativo</h3>
                <p className="car-total">
                    Total de usuários com carrinho: <strong>{totalUsuarios}</strong>
                </p>
            </section>

            <section className="car-secao">
                <h3 className="car-subtitulo">Usuários com mais produtos</h3>

                <ul className="car-lista">
                    {usuarios.map(u => (
                        <li key={u.id} className="car-item">
                            <span>
                                {u.nome} {u.sobrenome} — {u.total_itens} produtos
                            </span>

                            {u.whatsapp && (
                                <a
                                    className="car-whatsapp"
                                    href={`https://wa.me/55${u.whatsapp}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    WhatsApp
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="car-secao">
                <h3 className="car-subtitulo">Produtos que mais tem nos carrinhos</h3>

                <ul className="car-lista">
                    {produtos.map(p => (
                        <li key={p.id} className="car-item car-item-produto">
                            <img
                                className="car-produto-img"
                                src={p.imagem_um}
                                alt={p.produto}
                            />
                            <span>
                                {p.produto} — {p.total}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

        </main>
    );
}
