import React, { useEffect, useState } from "react";
import ListaCategorias from "./corpo/listacategoria";
import ModalProduto from "./corpo/modalproduto";
import ModalFiltro from "./corpo/modalfiltro";
import { API_URL } from "../../config";
import "./corpo.css";

export default function Corpo({ abrirFiltro, setAbrirFiltro }) {

    const [produtos, setProdutos] = useState([]);
    const [produtoAberto, setProdutoAberto] = useState(null);

    useEffect(() => {
        async function carregar() {
            try {
                const resp = await fetch(`${API_URL}/das/produtos/raw`);
                const json = await resp.json();
                setProdutos(json.produtos || []);
            } catch (e) {
                console.log("Erro ao carregar produtos");
            }
        }
        carregar();
    }, []);

    return (
        <div className="corpo-box">

            <ListaCategorias
                produtos={produtos}
                abrirModalProduto={setProdutoAberto}
            />

            {produtoAberto && (
                <ModalProduto
                    produto={produtoAberto}
                    fechar={() => setProdutoAberto(null)}
                />
            )}

            {abrirFiltro && (
                <ModalFiltro
                    fechar={() => setAbrirFiltro(false)}
                    setProdutos={setProdutos}
                />
            )}
        </div>
    );
}
