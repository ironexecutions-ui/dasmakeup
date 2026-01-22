import { useEffect } from "react";
import { API_URL } from "./config";

export default function Preloader({ onFinish }) {

    useEffect(() => {
        async function carregarTudo() {
            try {
                const resp = await fetch(`${API_URL}/das/preload`);
                const dados = await resp.json();

                localStorage.setItem("preload_dados", JSON.stringify(dados));
            } catch (e) {
                console.log("Erro ao carregar preload", e);
            } finally {
                onFinish();
            }
        }

        carregarTudo();
    }, []);

    return null; // invisível
}
