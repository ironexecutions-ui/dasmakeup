import React from "react";
import { useParams } from "react-router-dom";
import Enviando from "../src/components/painel/components/corpo/enviando";
import "./escaneando.css";

export default function Escaneando() {

    const { codigo } = useParams();

    return (
        <div className="escaneando">
            <Enviando qrInicial={codigo} />
        </div>
    );
}
