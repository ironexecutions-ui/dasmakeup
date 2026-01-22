export function criarIconeCarrinho(tamanho = 24, cor = "white") {
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", tamanho);
    svg.setAttribute("height", tamanho);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", cor);
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    // Carrinho baseado no ícone clássico do Feather Icons
    const path1 = document.createElementNS(svgNS, "path");
    path1.setAttribute("d", "M6 6h15l-1.5 9h-13z");

    const circle1 = document.createElementNS(svgNS, "circle");
    circle1.setAttribute("cx", "9");
    circle1.setAttribute("cy", "20");
    circle1.setAttribute("r", "2");

    const circle2 = document.createElementNS(svgNS, "circle");
    circle2.setAttribute("cx", "18");
    circle2.setAttribute("cy", "20");
    circle2.setAttribute("r", "2");

    const handle = document.createElementNS(svgNS, "path");
    handle.setAttribute("d", "M6 6L4 3H1");

    svg.appendChild(path1);
    svg.appendChild(circle1);
    svg.appendChild(circle2);
    svg.appendChild(handle);

    return svg;
}
