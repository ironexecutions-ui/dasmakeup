import React from "react";

import AdminTabela from "./corpo/admintabela";
import Pedidos from "./corpo/pedidos";
import Pagos from "./corpo/pagos";
import Enviando from "./corpo/enviando";
import ACaminho from "./corpo/acaminho";
import Entregues from "./corpo/entregues";
import Canceladospainel from "./corpo/canc";

import Produtos from "./botoes/produtos";
import Grafico from "./botoes/grafico";
import MaisMenos from "./botoes/maismenos";
import Conexoes from "./botoes/conexoes";
import Pesquisas from "./botoes/pesquisas";
import Avaliacao from "./botoes/avalicao";
import Sincronizar from "./botoes/sincronizar";
import PagamentosRecusados from "./botoes/recusados";
import Taxa from "./botoes/entregas";
import "./corpopainel.css";

export default function CorpoPainel({ telaHeader, telaBotao }) {

    if (telaBotao) {
        switch (telaBotao) {

            case "produtos":
                return <Produtos />;

            case "grafico":
                return <Grafico />;

            case "mais_menos":
                return <MaisMenos />;

            case "conexoes":
                return <Conexoes />;

            case "pesquisas":
                return <Pesquisas />;

            case "avaliacao":
                return <Avaliacao />;
            case "taxa":
                return <Taxa />;
            case "pagamentos_recusados":
                return <PagamentosRecusados />;

            case "sincronizar":
                return <Sincronizar />;

            default:
                return null;
        }
    }

    switch (telaHeader) {

        case "admins":
            return <AdminTabela tipo="admin" />;

        case "clientes":
            return <AdminTabela tipo="cliente" />;

        case "pedidos":
            return <Pedidos />;

        case "pagos":
            return <Pagos />;

        case "enviando":
            return <Enviando />;

        case "a_caminho":
            return <ACaminho />;

        case "entregues":
            return <Entregues />;

        case "cancelados":
            return <Canceladospainel />;

        default:
            return (
                <main className="corpo-painel">
                    <h2 style={{ color: "white" }}>Painel Administrativo</h2>

                    <p>
                        Este painel foi desenvolvido para centralizar o controle e o
                        acompanhamento de todas as operações da plataforma.
                        Aqui você tem uma visão clara do que está acontecendo em tempo real.
                    </p>

                    <p>
                        Através deste ambiente é possível gerenciar pedidos, acompanhar
                        envios em andamento, confirmar entregas, visualizar métricas de uso,
                        analisar carrinhos ativos e manter contato direto com os clientes
                        sempre que necessário.
                    </p>

                    <p>
                        Utilize o menu para navegar entre as seções disponíveis.
                        Cada área foi pensada para facilitar a tomada de decisões,
                        otimizar o atendimento e manter a organização do sistema.
                    </p>
                </main>
            );
    }
}
