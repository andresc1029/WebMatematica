const topData = {
    multiplicaciones: { actual: [], historico: [] },
    condicionales: { actual: [], historico: [] },
    razonamiento: { actual: [], historico: [] }
};

// Cargar datos del top desde el API
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

        // Mostrar top inicial
        mostrarTop("multiplicaciones", "actual");

    } catch (err) {
        console.error(err);
    }
}

// Función para renderizar el top
function mostrarTop(modulo, tipo) {
    const cuerpo = document.getElementById("tabla-top-body");
    cuerpo.innerHTML = "";

    const lista = topData[modulo][tipo];
    if (!lista.length) {
        cuerpo.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay datos disponibles</td></tr>`;
        return;
    }

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

// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
    // Cargar top
    cargarTop();

    // Elementos del menú de filtros
    const menuBtn = document.getElementById("menu-filtros-btn");
    const menu = document.getElementById("menu-filtros");
    const overlay = document.getElementById("overlay-filtros");

    if (menuBtn && menu && overlay) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.add("active");
            overlay.classList.add("active");
        });

        overlay.addEventListener("click", () => {
            menu.classList.remove("active");
            overlay.classList.remove("active");
        });

        // Evitar cerrar al click dentro del panel
        menu.addEventListener("click", (e) => e.stopPropagation());
    }

    // Botones de módulos
    const moduloBtns = document.querySelectorAll(".modulo-btn");
    moduloBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            moduloBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const modulo = btn.dataset.modulo;
            const tipoBtnActivo = document.querySelector(".tipo-btn.active");
            const tipo = tipoBtnActivo ? tipoBtnActivo.dataset.tipo : "actual";

            mostrarTop(modulo, tipo);
        });
    });

    // Botones de tipo (actual/histórico)
    const tipoBtns = document.querySelectorAll(".tipo-btn");
    tipoBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tipoBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tipo = btn.dataset.tipo;
            const moduloBtnActivo = document.querySelector(".modulo-btn.active");
            const modulo = moduloBtnActivo ? moduloBtnActivo.dataset.modulo : "multiplicaciones";

            mostrarTop(modulo, tipo);
        });
    });

    // Mostrar nombre del usuario desde localStorage
    const nombre = localStorage.getItem("usuario");
    const elementoNombre = document.getElementById("nombre-usuarioh1");
    if (nombre && elementoNombre) {
        elementoNombre.textContent = nombre;
        console.log("✅ Nombre mostrado correctamente:", nombre);
    }
});
