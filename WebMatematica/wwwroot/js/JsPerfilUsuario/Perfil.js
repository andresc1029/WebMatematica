const topData = {
    multiplicaciones: { actual: [], historico: [] },
    condicionales: { actual: [], historico: [] },
    razonamiento: { actual: [], historico: [] }
};

async function cargarTop() {
    try {
        const res = await fetch("https://localhost:7131/api/Top/completo");
        if (!res.ok) throw new Error("Error al cargar el top");
        const data = await res.json();
        console.log("✅ Datos crudos del API:", data);

        topData.multiplicaciones.actual = data.modulo0_Actual || [];
        topData.multiplicaciones.historico = data.modulo0_Historico || [];

        topData.condicionales.actual = data.modulo1_Actual || [];
        topData.condicionales.historico = data.modulo1_Historico || [];

        topData.razonamiento.actual = data.modulo2_Actual || [];
        topData.razonamiento.historico = data.modulo2_Historico || [];

        console.log("multiplicaciones.actual:", topData.multiplicaciones.actual);
        console.log("multiplicaciones.historico:", topData.multiplicaciones.historico);


        // Mostrar el top inicial
        mostrarTop("multiplicaciones", "actual");

    } catch (err) {
        console.error(err);
    }
}

function mostrarTop(modulo, tipo) {
    const cuerpo = document.getElementById("tabla-top-body");
    cuerpo.innerHTML = "";

    const lista = topData[modulo][tipo];
    lista.forEach((jugador, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${jugador.nombreUsuario}</td>
            <td>${tipo === "actual" ? jugador.rachaActual : jugador.rachaMaxima}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// Botones para cambiar módulo
document.querySelectorAll(".modulo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".modulo-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const modulo = btn.dataset.modulo;
        const tipo = document.querySelector(".tipo-btn.active").dataset.tipo;
        mostrarTop(modulo, tipo);
    });
});

// Botones para cambiar tipo
document.querySelectorAll(".tipo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tipo-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tipo = btn.dataset.tipo;
        const modulo = document.querySelector(".modulo-btn.active").dataset.modulo;
        mostrarTop(modulo, tipo);
    });
});

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarTop();
});
