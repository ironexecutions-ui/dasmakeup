import React, { useState, useEffect } from "react";
import { API_URL } from "./config";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/inicio/header";
import Corpo from "./components/inicio/corpo";
import ModalCarrinho from "./components/inicio/modals/modalcarrinho";
import ModalCompras from "./components/inicio/modals/modalcompras";
import Rodape from "./components/inicio/rodape";
import Painel from "./components/painel/painel";
import Escaneando from "../public/escaneando";
import Preloader from "./preloader";
import TelaLoading from "./loading";
import PublicProdutos from "../public/tabela";
import "./app.css";
export default function App() {

  const [carregando, setCarregando] = useState(true);
  const [abrirFiltro, setAbrirFiltro] = useState(false);
  const [painelAtivo, setPainelAtivo] = useState("corpo");

  // 🔹 REGISTRAR CONEXÃO (1 vez)
  useEffect(() => {
    async function registrarConexao() {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

      await fetch(`${API_URL}/das/conexoes/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id || null
        })
      });
    }

    registrarConexao();
  }, []);

  // 🔹 PROCESSAR COMPRA PENDENTE (1 vez)
  useEffect(() => {
    async function processarCompraPendente() {

      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      const pendente = JSON.parse(
        localStorage.getItem("compra_pendente") || "null"
      );

      if (!usuario.id || !pendente) return;

      try {
        await fetch(`${API_URL}/das/processo/historico`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: usuario.id,
            produto_id: pendente.produto_id
          })
        });

        await fetch(`${API_URL}/das/processo/quantos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: usuario.id,
            produto_id: pendente.produto_id,
            quantos: pendente.quantidade
          })
        });

        await fetch(`${API_URL}/das/processo/carrinho`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: usuario.id,
            produto_id: pendente.produto_id
          })
        });

        localStorage.removeItem("compra_pendente");

      } catch (e) {
        console.error("Erro ao processar compra pendente", e);
      }
    }

    processarCompraPendente();
  }, []);

  // 🔹 LOADING
  if (carregando) {
    return (
      <>
        <Preloader onFinish={() => setCarregando(false)} />
        <TelaLoading />
      </>
    );
  }

  // 🔹 APP NORMAL
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <div id="layout">
              <Header
                abrirFiltro={() => setAbrirFiltro(true)}
                painelAtivo={painelAtivo}
                setPainelAtivo={setPainelAtivo}
              />

              <div className="conteudo">
                {painelAtivo === "corpo" && (
                  <Corpo
                    abrirFiltro={abrirFiltro}
                    setAbrirFiltro={setAbrirFiltro}
                  />
                )}

                {painelAtivo === "carrinho" && (
                  <ModalCarrinho fechar={() => setPainelAtivo("corpo")} />
                )}

                {painelAtivo === "compras" && (
                  <ModalCompras fechar={() => setPainelAtivo("corpo")} />
                )}
              </div>

              <Rodape />
            </div>
          }
        />
        <Route
          path="/public"
          element={<PublicProdutos />}
        />
        <Route
          path="/escaneando/:codigo"
          element={<Escaneando />}
        />

        <Route
          path="/painel"
          element={
            <div style={{ padding: "30px" }}>
              <Painel />
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
