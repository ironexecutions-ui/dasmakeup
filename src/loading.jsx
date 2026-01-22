import { useEffect, useState } from "react";
import "./loading.css";

export default function TelaLoading() {

    const mensagens = [
        "Inicializando serviços",
        "Verificando integridade do ambiente",
        "Sincronizando dados",
        "Otimizando recursos",
        "Preparando interface"
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setIndex(prev => (prev + 1) % mensagens.length);
        }, 3800);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <div className="loading-global">
            <div className="loading-container">

                <img
                    src="https://djzdeyrhndgpxjntizpy.supabase.co/storage/v1/object/public/dass/imagem/WhatsApp%20Image%202026-01-10%20at%2019.01.53.jpeg"
                    alt="Dass"
                    className="logo-float"
                />

                <div className="brand-name">Dass</div>

                <div className="progress-line">
                    <span></span>
                </div>

                <p className="loading-message">
                    {mensagens[index]}
                </p>

            </div>
        </div>
    );
}
