import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../../../config";
import "./produtos.css";
import { supabase } from "../../../../../supabase";

export default function Produtos() {

    const [produtos, setProdutos] = useState([]);
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [modoForm, setModoForm] = useState(false);
    const inputFileRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const refs = useRef([]);

    const [form, setForm] = useState({
        id: null,
        produto: "",
        categoria: "",
        descricao: "",
        caracteristicas: [],
        novaCaracteristica: "",
        imagens: [null, null, null, null],
        peso: "",
        altura: "",
        largura: "",
        comprimento: "",
        preco: ""
    });

    function parseCaracteristicas(valor) {
        if (!valor) return [];
        if (Array.isArray(valor)) return valor;
        try {
            return JSON.parse(valor);
        } catch {
            return valor.split(";").map(v => v.trim()).filter(Boolean);
        }
    }

    async function carregarProdutos() {
        const resp = await fetch(`${API_URL}/das/produtos`);
        const json = await resp.json();
        if (json.ok) {
            const listaFiltrada = json.lista.filter(p => p.apagado !== 1);
            setProdutos(listaFiltrada);
        }
    }

    useEffect(() => {
        carregarProdutos();

        async function carregarCategorias() {
            const resp = await fetch(`${API_URL}/das/produtos/categorias`);
            const json = await resp.json();
            if (json.ok) setCategorias(json.categorias);
        }

        carregarCategorias();
    }, []);
    async function removerImagem(index, url) {
        const nomeArquivo = url.split("/").pop();

        const { error } = await supabase
            .storage
            .from("dass")
            .remove([`imagem/${nomeArquivo}`]);

        if (error) {
            console.error(error);
            alert("Erro ao remover imagem");
            return;
        }

        const imgs = [...form.imagens];
        imgs[index] = null;
        setForm({ ...form, imagens: imgs });
    }



    function abrirNovo() {
        setForm({
            id: null,
            produto: "",
            categoria: "",
            descricao: "",
            caracteristicas: [],
            novaCaracteristica: "",
            imagens: [null, null, null, null],
            peso: "",
            altura: "",
            largura: "",
            comprimento: "",
            preco: ""
        });
        setModoForm(true);
    }

    function editar(p) {
        setForm({
            id: p.id,
            produto: p.produto,
            categoria: p.categoria,
            descricao: p.descricao,
            caracteristicas: parseCaracteristicas(p.caracteristicas),
            novaCaracteristica: "",
            imagens: [p.imagem_um, p.imagem_dois, p.imagem_tres, p.imagem_quatro],
            peso: p.peso || "",
            altura: p.altura || "",
            largura: p.largura || "",
            comprimento: p.comprimento || "",
            preco: p.preco || ""
        });
        setModoForm(true);
    }

    async function apagarProduto(id) {
        const confirmar = window.confirm("Deseja realmente remover este produto?");
        if (!confirmar) return;

        const resp = await fetch(`${API_URL}/das/produtos/apagar/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const json = await resp.json();
        if (json.ok) carregarProdutos();
    }

    function adicionarCaracteristica() {
        const texto = primeiraMaiuscula(form.novaCaracteristica.trim());
        if (!texto) return;

        setForm({
            ...form,
            caracteristicas: [...form.caracteristicas, texto],
            novaCaracteristica: ""
        });
    }


    function removerCaracteristica(i) {
        const nova = [...form.caracteristicas];
        nova.splice(i, 1);
        setForm({ ...form, caracteristicas: nova });
    }

    function escolherImagem(i) {
        inputFileRef.current.dataset.index = i;
        inputFileRef.current.click();
    }

    async function enviarImagem(e) {
        const file = e.target.files[0];
        if (!file) return;

        const index = inputFileRef.current.dataset.index;
        const nomeArquivo = `${Date.now()}-${file.name}`;
        const caminho = `imagem/${nomeArquivo}`;

        const { error } = await supabase
            .storage
            .from("dass")
            .upload(caminho, file, { upsert: false });

        if (error) {
            console.error(error);
            alert("Erro ao enviar imagem");
            return;
        }

        const { data } = supabase
            .storage
            .from("dass")
            .getPublicUrl(caminho);

        const imgs = [...form.imagens];
        imgs[index] = data.publicUrl;

        setForm({ ...form, imagens: imgs });
        inputFileRef.current.value = "";
    }



    async function salvar() {
        const resp = await fetch(`${API_URL}/das/produtos/salvar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                caracteristicas: form.caracteristicas.join("; ")
            })
        });

        const json = await resp.json();
        if (json.ok) {
            carregarProdutos();
            setModoForm(false);
        }
    }
    // deixa sempre a primeira letra maiúscula
    function primeiraMaiuscula(valor) {
        if (!valor) return "";
        return valor.charAt(0).toUpperCase() + valor.slice(1);
    }
    // controla Enter para ir ao próximo input
    function irProximo(e, index) {
        if (e.key === "Enter") {
            e.preventDefault();
            refs.current[index + 1]?.focus();
        }
    }


    return (
        <main className="ppp-produtos-container">

            <h2 className="ppp-titulo">Produtos</h2>

            {!modoForm && (
                <>
                    <div className="ppp-filtros">
                        <input
                            placeholder="Filtrar por nome"
                            list="filtro-produtos"
                            value={filtroNome}
                            onChange={e => setFiltroNome(e.target.value)}
                        />

                        <datalist id="filtro-produtos">
                            {produtos.map(p => (
                                <option key={p.id} value={p.produto} />
                            ))}
                        </datalist>

                        <input
                            placeholder="Filtrar por categoria"
                            list="filtro-categorias"
                            value={filtroCategoria}
                            onChange={e => setFiltroCategoria(e.target.value)}
                        />

                        <datalist id="filtro-categorias">
                            {categorias.map((cat, i) => (
                                <option key={i} value={cat} />
                            ))}
                        </datalist>

                        <button className="ppp-btn-add" onClick={abrirNovo}>
                            + Adicionar Produto
                        </button>
                    </div>

                    <div className="ppp-tabela-box">
                        <table className="ppp-tabela">
                            <thead>
                                <tr>
                                    <th>Imagens</th>
                                    <th>Produto</th>
                                    <th>Categoria</th>
                                    <th>Descrição</th>
                                    <th>Características</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtos
                                    .filter(p => p.produto.toLowerCase().includes(filtroNome.toLowerCase()))
                                    .filter(p => p.categoria.toLowerCase().includes(filtroCategoria.toLowerCase()))
                                    .map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="ppp-imgs-mini">
                                                    {[p.imagem_um, p.imagem_dois, p.imagem_tres, p.imagem_quatro].map((img, i) =>
                                                        img ? (
                                                            <img key={i} src={img} className="ppp-mini" />
                                                        ) : (
                                                            <div key={i} className="ppp-mini ppp-mini-vazio"></div>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                            <td>{p.produto}</td>
                                            <td>{p.categoria}</td>
                                            <td>{p.descricao}</td>
                                            <td>{parseCaracteristicas(p.caracteristicas).join(", ")}</td>
                                            <td className="ppp-acoes">
                                                <button className="ppp-btn-editar" onClick={() => editar(p)}>
                                                    Editar
                                                </button>
                                                <button
                                                    className="ppp-btn-editar"
                                                    style={{ borderColor: "#ff5c5c", color: "#ff5c5c" }}
                                                    onClick={() => apagarProduto(p.id)}
                                                >
                                                    Apagar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {modoForm && (
                <div className="pppp-form-box">

                    <button className="ppp-btn-voltar" onClick={() => setModoForm(false)}>
                        ← Voltar
                    </button>

                    <h3>{form.id ? "Editar Produto" : "Novo Produto"}</h3>

                    <div>
                        Ao editar um produto, ele ficará disponível para sincronização.
                        Atenção: se apenas o nome for alterado, a sincronização não criará um novo item,
                        ela apenas copiará os dados necessários para manter as informações corretas.
                    </div>

                    <br />

                    {/* IMAGENS */}
                    <div className="ppp-imgs-form">
                        {form.imagens.map((img, i) => (
                            <div
                                key={i}
                                className="ppp-img-slot"
                                onClick={() => {
                                    inputFileRef.current.dataset.index = i;
                                    inputFileRef.current.click();
                                }}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    inputFileRef.current.dataset.index = i;
                                    const file = e.dataTransfer.files[0];
                                    if (!file) return;
                                    enviarImagem({ target: { files: [file] } });
                                }}
                            >
                                <span className="ppp-img-num">{i + 1}</span>

                                {img ? (
                                    <>
                                        <img src={img} className="ppp-img-preview" />
                                        <button
                                            className="ppp-img-delete"
                                            onClick={e => {
                                                e.stopPropagation();
                                                removerImagem(i, img);
                                            }}
                                        >
                                            🗑
                                        </button>
                                    </>
                                ) : (
                                    <div className="ppp-img-vazia">Arraste</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <input
                        ref={inputFileRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={enviarImagem}
                    />

                    {/* PRODUTO */}
                    {/* PRODUTO */}
                    <label>Produto</label>
                    <input
                        ref={el => refs.current[0] = el}
                        value={form.produto}
                        onChange={e =>
                            setForm({ ...form, produto: primeiraMaiuscula(e.target.value) })
                        }
                        onKeyDown={e => irProximo(e, 0)}
                    />

                    {/* CATEGORIA */}
                    <label>Categoria</label>
                    <input
                        ref={el => refs.current[1] = el}
                        list="lista-categorias"
                        value={form.categoria}
                        onChange={e =>
                            setForm({ ...form, categoria: primeiraMaiuscula(e.target.value) })
                        }
                        onKeyDown={e => irProximo(e, 1)}
                    />

                    {/* DESCRIÇÃO */}
                    <label>Descrição</label>
                    <textarea
                        ref={el => refs.current[2] = el}
                        value={form.descricao}
                        onChange={e =>
                            setForm({ ...form, descricao: primeiraMaiuscula(e.target.value) })
                        }
                        onKeyDown={e => irProximo(e, 2)}
                    />

                    {/* PESO */}
                    <label>Peso (kg)</label>
                    <input
                        ref={el => refs.current[3] = el}
                        type="number"
                        step="0.01"
                        value={form.peso}
                        onChange={e => setForm({ ...form, peso: e.target.value })}
                        onKeyDown={e => irProximo(e, 3)}
                    />

                    {/* ALTURA */}
                    <label>Altura (cm)</label>
                    <input
                        ref={el => refs.current[4] = el}
                        type="number"
                        step="0.01"
                        value={form.altura}
                        onChange={e => setForm({ ...form, altura: e.target.value })}
                        onKeyDown={e => irProximo(e, 4)}
                    />

                    {/* LARGURA */}
                    <label>Largura (cm)</label>
                    <input
                        ref={el => refs.current[5] = el}
                        type="number"
                        step="0.01"
                        value={form.largura}
                        onChange={e => setForm({ ...form, largura: e.target.value })}
                        onKeyDown={e => irProximo(e, 5)}
                    />

                    {/* COMPRIMENTO */}
                    <label>Comprimento (cm)</label>
                    <input
                        ref={el => refs.current[6] = el}
                        type="number"
                        step="0.01"
                        value={form.comprimento}
                        onChange={e => setForm({ ...form, comprimento: e.target.value })}
                        onKeyDown={e => irProximo(e, 6)}
                    />

                    {/* PREÇO */}
                    <label>Preço do produto</label>
                    <input
                        ref={el => refs.current[7] = el}
                        type="number"
                        step="0.01"
                        value={form.preco}
                        onChange={e => setForm({ ...form, preco: e.target.value })}
                        onKeyDown={e => irProximo(e, 7)}
                    />

                    {/* CARACTERÍSTICAS */}
                    <label>Características</label>
                    <div className="ppp-caracts">
                        <input
                            ref={el => refs.current[8] = el}
                            placeholder="Digite e clique +"
                            value={form.novaCaracteristica}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    novaCaracteristica: primeiraMaiuscula(e.target.value)
                                })
                            }
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    adicionarCaracteristica();
                                }
                            }}
                        />
                        <button className="ppp-btn-add-lista" onClick={adicionarCaracteristica}>
                            +
                        </button>
                    </div>


                    <ul className="ppp-lista-caracts">
                        {form.caracteristicas.map((c, i) => (
                            <li key={i}>
                                {c}
                                <button
                                    className="ppp-caract-del"
                                    onClick={() => removerCaracteristica(i)}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button className="ppp-btn-salvar" onClick={salvar}>
                        Salvar
                    </button>

                    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                </div>
            )}

        </main>
    );
}
