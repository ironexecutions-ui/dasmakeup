import React, { useRef, useEffect, useState } from "react";
import ProdutoCard from "./produtoscard";
import "./listacategoria.css";
import { API_URL } from "../../../config";

export default function ListaCategorias({ produtos, abrirModalProduto }) {

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    const [loading, setLoading] = useState(true);
    const [interesse, setInteresse] = useState([]);
    const [buscou, setBuscou] = useState(false);

    const [controleScroll, setControleScroll] = useState({});
    const listasRef = useRef({});
    const [categoriasAleatorias, setCategoriasAleatorias] = useState({});
    const shuffleInicializado = useRef(false);
    function produtoTemImagem(p) {
        if (!p.imagem_um) return false;

        const img = String(p.imagem_um).toLowerCase().trim();

        if (
            img === "pin" ||
            img === "null" ||
            img === "undefined" ||
            img === "0"
        ) return false;

        return img.startsWith("http://") || img.startsWith("https://");
    }



    /* ===============================
       SHUFFLE FIXO POR RENDER
    =============================== */
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* ===============================
       CONTROLE DE BUSCA
    =============================== */
    useEffect(() => {
        if (!loading) setBuscou(true);
    }, [loading]);

    useEffect(() => {
        if (!loading) window.scrollTo({ top: 0, behavior: "instant" });
    }, [loading]);

    /* ===============================
       CARREGAR INTERESSE
    =============================== */
    useEffect(() => {
        async function carregar() {
            if (usuario.id) {
                const resp = await fetch(`${API_URL}/das/produtos/interesse`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usuario_id: usuario.id })
                });

                const json = await resp.json();
                const filtrados = (json.produtos || []).filter(p => p.apagado !== 1);
                setInteresse(filtrados);
            }
            setLoading(false);
        }
        carregar();
    }, [usuario.id]);

    /* ===============================
       FILTRAR PRODUTOS VÁLIDOS
    =============================== */
    function produtoTemMedidas(p) {
        return [p.peso, p.altura, p.largura, p.comprimento].some(
            v => v !== null && v !== undefined && v !== "" && Number(v) > 0
        );
    }

    const produtosVisiveis = produtos.filter(
        p =>
            p.apagado !== 1 &&
            produtoTemMedidas(p) &&
            produtoTemImagem(p)
    );


    /* ===============================
       AGRUPAR POR CATEGORIA
    =============================== */
    const categorias = {};
    produtosVisiveis.forEach(p => {
        if (!categorias[p.categoria]) categorias[p.categoria] = [];
        categorias[p.categoria].push(p);
    });

    /* ===============================
       SHUFFLE APENAS QUANDO PRODUTOS MUDAM
    =============================== */
    useEffect(() => {
        // só executa quando os produtos chegarem pela primeira vez
        if (produtos.length === 0) return;

        setCategoriasAleatorias(prev => {
            // se já existe, não recalcula
            if (Object.keys(prev).length > 0) return prev;

            const novasCategorias = {};

            Object.keys(categorias).forEach(cat => {
                novasCategorias[cat] = shuffleArray(categorias[cat]);
            });

            return novasCategorias;
        });

    }, [produtos]);


    /* ===============================
       INTERESSE ÚNICO (SEM DUPLICAR)
    =============================== */
    const interesseUnico = Object.values(
        interesse
            .filter(p =>
                p.apagado !== 1 &&
                produtoTemImagem(p)
            )
            .reduce((acc, p) => {
                const chave = `${p.produto}-${p.preco}`;
                if (!acc[chave] || p.id > acc[chave].id) {
                    acc[chave] = p;
                }
                return acc;
            }, {})
    );


    /* ===============================
       SCROLL
    =============================== */
    function atualizarBotoes(cat) {
        const el = listasRef.current[cat];
        if (!el) return;

        setControleScroll(prev => ({
            ...prev,
            [cat]: {
                esquerda: el.scrollLeft > 0,
                direita: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
            }
        }));
    }

    function scroll(cat, direcao) {
        const el = listasRef.current[cat];
        if (!el) return;

        el.scrollBy({
            left: direcao === "direita" ? 320 : -320,
            behavior: "smooth"
        });

        setTimeout(() => atualizarBotoes(cat), 300);
    }

    function refLista(cat, el) {
        listasRef.current[cat] = el;
        if (el) requestAnimationFrame(() => atualizarBotoes(cat));
    }

    /* ===============================
       LOADING
    =============================== */
    if (loading) {
        return (
            <div className="categorias-loading">
                <div className="loader-ring"></div>
            </div>
        );
    }

    const nenhumaCategoria =
        interesseUnico.length === 0 &&
        Object.keys(categoriasAleatorias).length === 0;

    return (
        <div className="categorias-box">

            {buscou && nenhumaCategoria && (
                <div className="categoria-vazia">
                    <h2>Nenhum produto encontrado</h2>
                    <p>Não encontramos produtos com os filtros selecionados.</p>
                </div>
            )}

            {/* DO SEU INTERESSE */}
            {interesseUnico.length > 0 && (
                <div className="categoria-grupo">
                    <h2 className="categoria-titulo">Do seu interesse</h2>

                    <div className="categoria-lista-wrapper">

                        {controleScroll["interesse"]?.esquerda && (
                            <button
                                className="scroll-btn esquerda"
                                onClick={() => scroll("interesse", "esquerda")}
                            >
                                ‹
                            </button>
                        )}

                        <div
                            className="categoria-lista"
                            ref={el => refLista("interesse", el)}
                            onScroll={() => atualizarBotoes("interesse")}
                        >
                            {interesseUnico.map(prod => (
                                <ProdutoCard
                                    key={`${prod.id}-${prod.produto}-${prod.preco}`}
                                    produto={prod}
                                    abrirModalProduto={abrirModalProduto}
                                />
                            ))}
                        </div>

                        {controleScroll["interesse"]?.direita && (
                            <button
                                className="scroll-btn direita"
                                onClick={() => scroll("interesse", "direita")}
                            >
                                ›
                            </button>
                        )}

                    </div>

                </div>
            )}

            {/* CATEGORIAS */}
            {Object.keys(categoriasAleatorias).map(cat => (
                <div key={cat} className="categoria-grupo">
                    <h2 className="categoria-titulo">{cat}</h2>

                    <div className="categoria-lista-wrapper">

                        {controleScroll[cat]?.esquerda && (
                            <button
                                className="scroll-btn esquerda"
                                onClick={() => scroll(cat, "esquerda")}
                            >
                                ‹
                            </button>
                        )}

                        <div
                            className="categoria-lista"
                            ref={el => refLista(cat, el)}
                            onScroll={() => atualizarBotoes(cat)}
                        >
                            {categoriasAleatorias[cat].map(p => (
                                <ProdutoCard
                                    key={`${p.id}-${p.produto}-${p.preco}`}
                                    produto={p}
                                    abrirModalProduto={abrirModalProduto}
                                />
                            ))}
                        </div>

                        {controleScroll[cat]?.direita && (
                            <button
                                className="scroll-btn direita"
                                onClick={() => scroll(cat, "direita")}
                            >
                                ›
                            </button>
                        )}

                    </div>

                </div>
            ))}

        </div>
    );
}
