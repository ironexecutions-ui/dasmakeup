import React from "react";
import "./rodape.css";

export default function Rodape() {

    const numero = "5586999338456";

    function abrirZap(texto) {
        const msg = encodeURIComponent(texto);
        window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
    }

    return (
        <footer className="rodape-box">

            <div className="rodape-conteudo">

                <div className="rodape-coluna">
                    <img style={{ borderRadius: "100%" }} src="https://djzdeyrhndgpxjntizpy.supabase.co/storage/v1/object/public/dass/imagem/WhatsApp%20Image%202026-01-10%20at%2019.01.53.jpeg" alt="" className="logo-m" />

                    <h3>Dass</h3>
                    <p>Beleza, cuidado e estilo em cada detalhe, produtos selecionados para valorizar você todos os dias.</p>
                </div>

                <div className="rodape-coluna">
                    <h4>Fale conosco</h4>
                    <ul>
                        <li onClick={() => abrirZap("Olá, tudo bem? Gostaria de entrar em contato com o atendimento da Dass.")}>
                            Contato
                        </li>

                        <li onClick={() => abrirZap("Olá, poderia me ajudar? Tenho uma dúvida sobre um produto da Dass.")}>
                            Ajuda
                        </li>

                        <li onClick={() => abrirZap("Oi, queria saber mais informações sobre envio e entrega dos produtos.")}>
                            Envio e entrega
                        </li>

                        <li onClick={() => abrirZap("Olá, gostaria de saber como funcionam as trocas e devoluções.")}>
                            Trocas e devoluções
                        </li>
                    </ul>
                </div>

                <div className="rodape-coluna">
                    <h4>Visite nossas Redes sociais</h4>
                    <ul>
                        <li>
                            <a href="https://www.instagram.com/dass.oficial_/"
                                target="_blank"
                                rel="noopener noreferrer">
                                Instagram
                            </a>
                        </li>





                    </ul>
                </div>

            </div>

            <div className="rodape-final">
                <p>
                    Desenvolvido por
                    <a href="https://ironexecutions.com.br" target="_blank" rel="noopener noreferrer">
                        {" "}Iron Executions
                    </a>
                </p>
            </div>

        </footer>
    );
}
