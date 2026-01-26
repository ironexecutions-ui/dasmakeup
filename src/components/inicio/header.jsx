import React, { useEffect, useRef, useState } from "react";
import ModalCarrinho from "./modals/modalcarrinho";
import ModalCompras from "./modals/modalcompras";
import { criarIconeCarrinho } from "./icones/carrinho";
import ModalLogin from "./modals/modallogin";
import ModalPerfil from "./modals/modalperfil";
import "./header.css";
import { API_URL } from "../../config";

export default function Header({ abrirFiltro, painelAtivo, setPainelAtivo }) {

    const [usuario, setUsuario] = useState(null);
    const [compacto, setCompacto] = useState(false);
    const [abrirLogin, setAbrirLogin] = useState(false);
    const [abrirPerfil, setAbrirPerfil] = useState(false);
    const [qtdCarrinho, setQtdCarrinho] = useState(0);
    const [mostrarAvisoEndereco, setMostrarAvisoEndereco] = useState(false);
    const [comprasPendentes, setComprasPendentes] = useState(false);
    async function verificarComprasPendentes() {
        if (!usuario?.id) {
            setComprasPendentes(false);
            return;
        }

        try {
            const r = await fetch(`${API_URL}/das/processo/compras/pendentes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: usuario.id })
            });

            const json = await r.json();
            setComprasPendentes(!!json.tem_pendente);
        } catch {
            setComprasPendentes(false);
        }
    }

    const refCarrinho = useRef(null);
    async function carregarQtdCarrinho() {
        if (!usuario?.id) {
            setQtdCarrinho(0);
            return;
        }

        const r = await fetch(`${API_URL}/das/processo/carrinho/quantidade`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_id: usuario.id })
        });

        const json = await r.json();
        if (json.total !== undefined) {
            setQtdCarrinho(json.total);
        }
    }
    useEffect(() => {
        verificarComprasPendentes();
    }, [usuario, painelAtivo]);

    useEffect(() => {
        carregarQtdCarrinho();
    }, [usuario, painelAtivo]);
    useEffect(() => {
        if (!usuario?.id) return;

        if (!usuario.cep || usuario.cep.trim() === "") {

            const intervalo = setInterval(() => {
                setMostrarAvisoEndereco(true);

                setTimeout(() => {
                    setMostrarAvisoEndereco(false);
                }, 2000);

            }, 10000);

            return () => clearInterval(intervalo);
        }

    }, [usuario]);

    // --------------------------- GARANTIR ÍCONE ---------------------------
    function garantirIconeCarrinho() {

        if (!refCarrinho.current) return;

        if (painelAtivo === "carrinho") {
            refCarrinho.current.innerHTML = "";
            return;
        }

        if (refCarrinho.current.children.length === 0) {
            const icone = criarIconeCarrinho(22, "white");
            refCarrinho.current.innerHTML = "";
            refCarrinho.current.appendChild(icone);
        }
    }

    useEffect(() => {
        garantirIconeCarrinho();
    }, []);

    useEffect(() => {
        if (usuario) garantirIconeCarrinho();
    }, [usuario]);

    useEffect(() => {
        garantirIconeCarrinho();
    }, [painelAtivo]);

    useEffect(() => {
        const t = setInterval(() => garantirIconeCarrinho(), 300);
        return () => clearInterval(t);
    }, []);

    // Carrega usuário no início
    useEffect(() => {
        const u = localStorage.getItem("usuario");
        if (u) setUsuario(JSON.parse(u));
    }, []);
    useEffect(() => {
        if (!usuario) return;

        const nomeVazio =
            usuario.nome === null ||
            usuario.nome === undefined ||
            String(usuario.nome).trim() === "";

        if (!nomeVazio) return;

        const timer = setTimeout(() => {
            // logout forçado
            localStorage.removeItem("usuario");
            localStorage.removeItem("token");

            setUsuario(null);
            setPainelAtivo("corpo");

            window.location.reload();
        }, 3000);

        return () => clearTimeout(timer);
    }, [usuario]);

    // --------------------------- ATUALIZAR USUÁRIO A CADA 5 MINUTOS ---------------------------
    useEffect(() => {
        const interval = setInterval(() => {
            const u = localStorage.getItem("usuario");
            if (u) {
                const json = JSON.parse(u);

                // Só atualiza se mudou
                if (!usuario || json.nome !== usuario.nome) {
                    setUsuario(json);
                }
            }
        }, 300000); // 300 segundos = 5 minutos

        return () => clearInterval(interval);
    }, [usuario]);

    // --------------------------- HEADER COMPACTO ---------------------------
    useEffect(() => {
        function aoRolar() {
            setCompacto(window.scrollY > 34);
        }
        window.addEventListener("scroll", aoRolar);
        return () => window.removeEventListener("scroll", aoRolar);
    }, []);

    return (
        <>
            <header className={`header-box ${compacto ? "header-escondido" : "header-visivel"}`}>

                <div className="header-esq">
                    <img style={{ borderRadius: "100%" }} src="https://djzdeyrhndgpxjntizpy.supabase.co/storage/v1/object/public/dass/imagem/WhatsApp%20Image%202026-01-10%20at%2019.01.53.jpeg" alt="" className="logo-m" />
                    <h2 className="header-titulo">Dass</h2>
                </div>

                <div className="header-centro">
                    <input
                        readOnly
                        tabIndex={-1}
                        className="header-input"
                        placeholder="Busque seus produtos aqui."
                        onClick={() => abrirFiltro(true)}
                    />

                </div>

                <div className="header-dir">

                    {!usuario && (
                        <button
                            className="header-btn"
                            onClick={() => setAbrirLogin(true)}
                        >
                            Entrar
                        </button>
                    )}

                    {usuario && (
                        <>

                            <div
                                className={`header-ttl ${(!usuario.cep || usuario.cep === "") ? "perfil-piscando" : ""}`}

                            >
                                {usuario.nome}
                            </div>
                            <div
                                className={`header-btn`}

                                onClick={() => {
                                    setPainelAtivo("corpo");
                                    setAbrirPerfil(true);
                                }}
                                style={{ cursor: "pointer", }}
                            >
                                Dados
                            </div>
                            {/* Botão Carrinho */}


                            <div className="perfil-wrapper">



                                {mostrarAvisoEndereco && (
                                    <div className="aviso-endereco">
                                        Cadastre seu endereço por favor
                                    </div>
                                )}
                            </div>
                            <button
                                className={`header-btn header-btn-carrinho ${painelAtivo === "carrinho" ? "ativo" : ""}`}
                                onClick={() => {
                                    setPainelAtivo(painelAtivo === "carrinho" ? "corpo" : "carrinho");
                                }}
                            >
                                {painelAtivo === "carrinho" ? "Produtos" : (
                                    <span className="carrinho-icone-wrapper">
                                        <span ref={refCarrinho}></span>

                                        {qtdCarrinho > 0 && (
                                            <span className="carrinho-badge">
                                                {qtdCarrinho}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </button>
                            {/* Botão Compras */}
                            <button
                                style={{ marginRight: "20px" }}
                                className={`header-btn 
        ${painelAtivo === "compras" ? "ativo" : ""}
${comprasPendentes && painelAtivo !== "compras" ? "compras-piscando" : ""}
    `}
                                onClick={() => {
                                    setPainelAtivo(painelAtivo === "compras" ? "corpo" : "compras");
                                }}
                            >
                                {painelAtivo === "compras" ? "Produtos" : "Compras"}
                            </button>



                        </>
                    )}

                </div>
            </header>

            {compacto && (
                <div
                    className="header-bolinha"
                    onClick={() => {
                        setCompacto(false);
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }}
                >
                    <img src="https://djzdeyrhndgpxjntizpy.supabase.co/storage/v1/object/public/dass/imagem/WhatsApp%20Image%202026-01-10%20at%2019.01.53.jpeg" className="bolinha-logo" />
                </div>

            )}

            {abrirLogin && (
                <div className="modal-area">
                    <ModalLogin fechar={() => setAbrirLogin(false)} />
                </div>
            )}

            {abrirPerfil && (
                <div className="modal-area">
                    <ModalPerfil fechar={() => setAbrirPerfil(false)} />
                </div>
            )}
        </>
    );
}
