// CONFIGURACIÓN
const apiBase = 'https://localhost:7131';
const modo = 1; // Condiciones

// Referencias a elementos del DOM
const enunciadoDiv = document.getElementById('enunciado');
const opcionesList = document.getElementById('opciones');
const resultadoSection = document.getElementById('resultadoSection');
const resultadoTexto = document.getElementById('resultadoTexto');
const rachaActualSpan = document.getElementById('rachaActual');
const rachaMaximaSpan = document.getElementById('rachaMaxima');
const btnObtener = document.getElementById('btnObtener');
const btnResponder = document.getElementById('btnResponder');

let problemaActual = null;
let opcionSeleccionada = null;



// Extraer payload del JWT
function parseJwt(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

// Obtener usuarioId desde token
const token = localStorage.getItem('token');
let usuarioId = null;
if (token) {
    const payload = parseJwt(token);
    if (payload && payload.userId) {
        usuarioId = Number(payload.userId);
    }
}

if (!usuarioId) {
    alert("No se pudo identificar el usuario. Por favor inicia sesión de nuevo.");
}

// =========================
// FUNCIONES PRINCIPALES
// =========================

// Actualizar racha en pantalla
function actualizarRacha(actual, maxima) {
    rachaActualSpan.textContent = actual ?? 0;
    rachaMaximaSpan.textContent = maxima ?? 0;
}

// Mostrar problema
async function cargarProblema() {
    try {
        const res = await fetch(`${apiBase}/api/ControladorProblemasCondiciones/obtener/${usuarioId}/${modo}`);
        if (!res.ok) throw new Error('No se pudo obtener problema');
        const data = await res.json();

        problemaActual = data;
        opcionSeleccionada = null;
        btnResponder.disabled = true;

        // Mostrar enunciado
        enunciadoDiv.textContent = data.enunciado;

        // Mostrar opciones
        opcionesList.innerHTML = '';
        data.opciones.forEach(op => {
            const li = document.createElement('li');
            li.textContent = op;
            li.className = 'opcion';
            li.addEventListener('click', () => {
                document.querySelectorAll('.opcion').forEach(el => el.classList.remove('seleccionada'));
                li.classList.add('seleccionada');
                opcionSeleccionada = op;
                btnResponder.disabled = false;
            });
            opcionesList.appendChild(li);
        });

        // Ocultar sección de resultado mientras no haya respuesta
        resultadoSection.classList.add('hidden');
    } catch (err) {
        console.error(err);
        enunciadoDiv.textContent = "⚠️ No hay problemas disponibles";
    }
}

// Enviar respuesta del usuario
async function enviarRespuesta() {
    if (!problemaActual || !opcionSeleccionada) return;
    btnResponder.disabled = true;

    const body = {
        UsuarioId: usuarioId,
        Modo: modo,
        ProblemaId: problemaActual.problemaId,
        RespuestaUsuario: opcionSeleccionada
    };

    try {
        const res = await fetch(`${apiBase}/api/ControladorProblemasCondiciones/responder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        // Mostrar resultado
        resultadoSection.classList.remove('hidden');
        resultadoTexto.textContent = data.correcta ? '✅ ¡Correcto!' : '❌ Incorrecto';
        resultadoTexto.style.color = data.correcta ? '#0d6efd' : '#ff4c4c';

        // Actualizar racha
        actualizarRacha(data.rachaActual, data.rachaMaxima);

        // Animación shake si falla
        if (!data.correcta) {
            resultadoTexto.classList.add('incorrecta');
            setTimeout(() => resultadoTexto.classList.remove('incorrecta'), 500);
        } else {
            lanzarParticulas();
        }

        // Preparar siguiente problema si acertó
        if (data.correcta) {
            setTimeout(() => {
                cargarProblema();
                btnResponder.disabled = true;
            }, 800);
        } else {
            btnResponder.disabled = false;
        }

    } catch (err) {
        console.error("Error al enviar respuesta:", err);
        btnResponder.disabled = false;
    }
}

// =========================
// EFECTOS
// =========================

// Partículas al acertar
function lanzarParticulas() {
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particula';
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        p.style.setProperty('--x', `${x}px`);
        p.style.setProperty('--y', `${y}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

// =========================
// EVENTOS
// =========================
btnObtener.addEventListener('click', cargarProblema);
btnResponder.addEventListener('click', enviarRespuesta);

// =========================
// INICIALIZACIÓN
// =========================
cargarProblema();
