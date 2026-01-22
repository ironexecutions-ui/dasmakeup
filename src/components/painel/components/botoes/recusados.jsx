import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "./recusados.css";

export default function PagamentosRecusados() {

    const [lista, setLista] = useState([]);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(true);
    const [abrindoZap, setAbrindoZap] = useState(null);
    const [limite, setLimite] = useState(5);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        try {
            setLoading(true);
            const r = await fetch(`${API_URL}/das/pagamentos/recusados`);
            const j = await r.json();

            if (!r.ok) {
                setErro("Erro ao carregar pagamentos recusados");
                return;
            }

            setLista(j);
        } catch {
            setErro("Falha de conexão");
        } finally {
            setLoading(false);
        }
    }

    function abrirWhatsapp(numero, nome) {
        if (!numero) return;

        setAbrindoZap(numero);

        const limpo = numero.replace(/\D/g, "");

        const mensagem = `
Olá ${nome || ""}, somos da Dass.

Identificamos que você tentou finalizar uma compra em nosso sistema, mas o pagamento não foi concluído.

Estamos aqui para te ajudar a finalizar ou esclarecer qualquer dúvida. Pode nos contar o que aconteceu?
        `.trim();

        const texto = encodeURIComponent(mensagem);

        window.open(`https://wa.me/55${limpo}?text=${texto}`, "_blank");

        setTimeout(() => {
            setAbrindoZap(null);
        }, 800);
    }

    function contarRecusadosHoje() {
        const agora = new Date();

        const inicioOntem = new Date();
        inicioOntem.setDate(agora.getDate() - 1);
        inicioOntem.setHours(0, 0, 0, 0);

        const fimHoje = new Date();
        fimHoje.setHours(23, 59, 59, 999);

        return lista.filter(i => {
            if (!i.criado_em) return false;

            const [data, hora] = i.criado_em.split(" ");
            const [dia, mes, ano] = data.split("/");
            const [h, m] = hora.split(":");

            const d = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                Number(h),
                Number(m)
            );

            return d >= inicioOntem && d <= fimHoje;
        }).length;
    }

    const listaOrdenada = lista.slice().reverse();
    const listaVisivel = listaOrdenada.slice(0, limite);
    function formatarDataMenos3Horas(dataStr) {
        if (!dataStr) return "";

        const [data, hora] = dataStr.split(" ");
        const [dia, mes, ano] = data.split("/");
        const [h, m] = hora.split(":");

        const d = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(h),
            Number(m)
        );

        d.setHours(d.getHours() - 3);

        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");

        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }

    return (
        <main className="corpo-painell">

            <h2>Pagamentos recusados</h2>

            <p className="contador-recusa">
                Recusados entre ontem e hoje:
                <strong> {contarRecusadosHoje()}</strong>
            </p>

            {erro && <p className="erro">{erro}</p>}

            {loading && (
                <div className="loading">
                    Carregando pagamentos recusados...
                </div>
            )}

            {!loading && (
                <>
                    <div className="tabela-container">
                        <table className="tabela-recusa">

                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>Contato</th>
                                    <th>Email</th>
                                    <th>Total</th>
                                    <th>Frete</th>
                                    <th>Tipo</th>
                                    <th>Detalhe</th>
                                    <th>Data</th>
                                </tr>
                            </thead>

                            <tbody>
                                {listaVisivel.map((i) => (
                                    <tr key={i.id}>

                                        <td>
                                            {i.nome} {i.sobrenome}
                                        </td>

                                        <td>
                                            {i.whatsapp && (
                                                <button
                                                    className="btn-whats"
                                                    disabled={abrindoZap === i.whatsapp}
                                                    onClick={() =>
                                                        abrirWhatsapp(
                                                            i.whatsapp,
                                                            i.nome
                                                        )
                                                    }
                                                >
                                                    {abrindoZap === i.whatsapp
                                                        ? "Abrindo..."
                                                        : i.whatsapp}
                                                </button>
                                            )}
                                        </td>

                                        <td>{i.email}</td>

                                        <td>
                                            R$ {Number(i.total || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            R$ {Number(i.frete || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            <span className="tipo">
                                                {i.tipo}
                                            </span>
                                        </td>

                                        <td className="detalhe">
                                            {i.detalhe}
                                        </td>

                                        <td>{formatarDataMenos3Horas(i.criado_em)}</td>

                                    </tr>
                                ))}

                                {lista.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="vazio">
                                            Nenhum pagamento recusado encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>

                    {limite < listaOrdenada.length && (
                        <div className="carregar-mais">
                            <button
                                onClick={() => setLimite(l => l + 10)}
                            >
                                Carregar mais 10
                            </button>
                        </div>
                    )}
                </>
            )}

        </main>
    );
}
