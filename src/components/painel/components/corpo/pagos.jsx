import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import QRCode from "react-qr-code";
import "./pagos.css";

export default function Pagos() {

    const [vendas, setVendas] = useState([]);
    const [comanda, setComanda] = useState(null);

    async function carregar() {
        try {
            const resp = await fetch(`${API_URL}/das/vendas/pagas`);
            const json = await resp.json();
            setVendas(json.vendas || []);
        } catch (e) {
            console.log("Erro ao carregar vendas pagas", e);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    function abrirComanda(venda) {
        setComanda(venda);
    }
    function tipoEntregaTexto(endereco) {
        if (!endereco) return "";

        if (endereco.startsWith("Dass")) return "Dass";
        if (endereco.startsWith("Na loja")) return "RETIRADA NA LOJA";

        return "ENTREGA";
    }

    function imprimirComanda(venda) {
        const conteudo = `
<html>
<head>
    <title>Comanda</title>
    <style>
        @page {
            size: 58mm auto;
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: monospace;
        }

        .comanda {
            width: 58mm;
            padding: 6mm;
            font-size: 12px;
        }

        h2, h3 {
            margin: 0 0 6px 0;
            text-align: center;
        }

        .cliente {
            margin-bottom: 10px;
            font-size: 11px;
        }

        .item {
            margin-bottom: 6px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #000;
            font-size: 11px;
        }

        .total {
            margin-top: 10px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
        }

        .frete {
            margin-top: 6px;
            font-size: 11px;
        }

        img {
            display: block;
            margin: 10px auto 0 auto;
            max-width: 95%;
        }
    </style>
</head>

<body>
    <div class="comanda">
        <h2>Dass</h2>
<h3>Protocolo: ${venda.venda_numero}</h3>

<div style="
    text-align:center;
    margin:6px 0 10px 0;
    font-weight:bold;
    font-size:13px;
">
    ${venda.usuario.endereco.startsWith("Dass")
                ? "Dass"
                : venda.usuario.endereco.startsWith("Na loja")
                    ? "RETIRADA NA LOJA"
                    : "ENTREGA"
            }
</div>

<div class="cliente">
    CNPJ: 61.756.733/0001-45<br/>
    Endereço: Av. Hugo Napoleao, 610, Agricolândia - PI, 64440-000<br/>
    Contato: +55 86 9810-4089<br/>
    E-mail: dassoficial24@gmail.com
</div>



        <div class="cliente">
            Cliente: ${venda.usuario.nome} ${venda.usuario.sobrenome}<br/>
            WhatsApp: ${venda.usuario.whatsapp}<br/>
            Email: ${venda.usuario.email}<br/>
            Endereço: ${venda.usuario.endereco}
        </div>

   ${venda.produtos.map(p => `
    <div class="item">
        ${p.nome}<br/>
        ${p.carateristica ? `<small>${p.carateristica}</small><br/>` : ""}
        Qtd ${p.quantos} x R$ ${p.preco.toFixed(2)}<br/>
        Subtotal R$ ${p.subtotal.toFixed(2)}
    </div>
`).join("")}


        <div class="frete">Frete R$ ${venda.frete.toFixed(2)}</div>

        <div class="total">Total R$ ${venda.total.toFixed(2)}</div>

        <img id="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/escaneando/${venda.qr_code}" />
    </div>
</body>
</html>
`;

        const janela = window.open("", "_blank");
        janela.document.write(conteudo);
        janela.document.close();

        // Esperar o QR carregar antes de imprimir
        const verificarQR = setInterval(() => {
            const img = janela.document.getElementById("qr");

            if (img && img.complete) {
                clearInterval(verificarQR);

                // pequeno atraso extra por segurança
                setTimeout(() => {
                    janela.focus();
                    janela.print();
                    janela.close();
                }, 150);
            }
        }, 100);
    }


    async function confirmarVenda(venda_numero) {
        await fetch(`${API_URL}/das/vendas/confirmar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ venda_numero })
        });

        setComanda(null);
        carregar();
    }

    return (
        <main className="pp-corpo-painel">
            <h2>Pedidos Pagos</h2>

            {vendas.length === 0 && (
                <p>Nenhum pedido pago encontrado.</p>
            )}

            {vendas.map(v => (
                <div key={v.venda_numero} className="pp-venda-card">

                    <h3>Venda #{v.venda_numero}</h3>
                    <p className="pp-cliente-info">
                        {v.usuario.nome} {v.usuario.sobrenome}<br />
                        {v.usuario.whatsapp}<br />
                        {v.usuario.email}<br />
                        {v.usuario.endereco}
                    </p>

                    <div className="pp-produtos-lista">
                        {v.produtos.map((p, i) => (
                            <div key={i} className="pp-produto-item">
                                <img src={p.imagem} alt="" className="pp-produto-img" />
                                <div>
                                    <p>{p.nome}</p>

                                    {p.carateristica && p.carateristica.trim() !== "" && (
                                        <p className="pp-produto-caracteristica">
                                            {p.carateristica}
                                        </p>
                                    )}

                                    <p>Qtd: {p.quantos}</p>
                                    <p>Preço: R$ {p.preco.toFixed(2)}</p>
                                </div>

                            </div>
                        ))}
                    </div>

                    <p className="pp-total-geral">
                        Total da venda: R$ {v.total.toFixed(2)}
                    </p>

                    <button onClick={() => abrirComanda(v)} className="pp-btn-comanda">
                        Abrir Comanda
                    </button>
                    <br /><br /><br /><br />

                </div>
            ))}

            {comanda && (
                <div className="pp-comanda-overlay">
                    <div className="pp-comanda-box">

                        <button className="pp-btn-fechar" onClick={() => setComanda(null)}>
                            X
                        </button>

                        <h2 style={{ color: "blue" }} >Dass</h2>
                        <div class="cliente">
                            CNPJ: 61.756.733/0001-45<br />
                            Endereço: Av. Hugo Napoleão, 610<br />
                            Contato: (61) 99124-8207<br />
                            E-mail: dassoficial24@gmail.com
                        </div>

                        <h3 style={{ color: "white" }} >Protocolo: {comanda.venda_numero}</h3>

                        <div className="pp-comanda-tipo">
                            {tipoEntregaTexto(comanda.usuario.endereco)}
                        </div>
                        <div className="pp-cliente-comanda">
                            <p><strong>Cliente</strong> {comanda.usuario.nome} {comanda.usuario.sobrenome}</p>
                            <p><strong>WhatsApp</strong> {comanda.usuario.whatsapp}</p>
                            <p><strong>Email</strong> {comanda.usuario.email}</p>
                            <p><strong>Endereço</strong> {comanda.usuario.endereco}</p>
                        </div>

                        <div className="pp-comanda-produtos">
                            {comanda.produtos.map((p, i) => (
                                <div key={i} className="pp-comanda-item">
                                    <p>{p.nome}</p>

                                    {p.carateristica && p.carateristica.trim() !== "" && (
                                        <p className="pp-comanda-caracteristica">
                                            {p.carateristica}
                                        </p>
                                    )}

                                    <p>{p.quantos} x R$ {p.preco.toFixed(2)}</p>
                                    <p>Subtotal R$ {p.subtotal.toFixed(2)}</p>

                                </div>
                            ))}
                        </div>

                        <p className="pp-comanda-frete">
                            Frete: R$ {comanda.frete.toFixed(2)}
                        </p>

                        <h3 className="pp-comanda-total">
                            Total: R$ {comanda.total.toFixed(2)}
                        </h3>

                        <div className="pp-qr-area">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/escaneando/${comanda.qr_code}`}
                                className="pp-qr-img"
                            />


                        </div>

                        <button
                            className="pp-btn-confirmar"
                            onClick={async () => {
                                await confirmarVenda(comanda.venda_numero);
                                imprimirComanda(comanda);
                            }}
                        >
                            Confirmar e Imprimir
                        </button>

                    </div>
                </div>
            )}
        </main>
    );
}
