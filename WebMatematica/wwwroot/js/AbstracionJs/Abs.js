// CONFIGURACIÓN
const apiBase = 'https://localhost:7131'; // Cambia según tu puerto
const modo = 2; // Modo 2 - Abstracción

// Referencias a elementos del DOM
const tituloDiv = document.getElementById('preguntaTitulo');
const descripcionDiv = document.getElementById('preguntaDescripcion');
const imagenDiv = document.getElementById('preguntaImagen');
const opcionesList = document.getElementById('opcionesList');
const respuestaInput = document.getElementById('respuestaUsuario');
const btnResponder = document.getElementById('enviarRespuesta');
const resultadoDiv = document.getElementById('resultadoMensaje');
const rachaBadge = document.getElementById('rachaBadge');

let preguntaActual = null;
let opcionSeleccionada = null;

// Extraer payload del JWT (si usas JWT)
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

// Actualizar racha
function actualizarRacha(actual, maxima) {
    rachaBadge.textContent = `Racha: ${actual ?? 0}`;
}

// Cargar pregunta
async function cargarPregunta() {
    try {
        const res = await fetch(`${apiBase}/api/ControladorAbstraccion/obtener/${usuarioId}/${modo}`);
        if (!res.ok) throw new Error('No se pudo obtener la pregunta');
        const data = await res.json();

        preguntaActual = data;
        opcionSeleccionada = null;
        btnResponder.disabled = true;

        // Mostrar datos
        tituloDiv.textContent = data.titulo;
        descripcionDiv.textContent = data.descripcion;
        imagenDiv.src = data.imagen ?? '';
        actualizarRacha(data.rachaActual ?? 0, data.rachaMaxima ?? 0);

        // Mostrar opciones como botones
        opcionesList.innerHTML = '';
        data.opciones.forEach(op => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary opcion';
            btn.textContent = op; // Solo A, B, C...
            btn.dataset.opcion = op;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.opcion').forEach(el => el.classList.remove('seleccionada'));
                btn.classList.add('seleccionada');
                opcionSeleccionada = op;
                btnResponder.disabled = false;
            });
            opcionesList.appendChild(btn);
        });


    } catch (err) {
        console.error(err);
        tituloDiv.textContent = "⚠️ No hay preguntas disponibles";
        descripcionDiv.textContent = '';
        imagenDiv.src = '';
    }
}

// Enviar respuesta
async function enviarRespuesta() {
    if (!preguntaActual || !opcionSeleccionada) return;
    btnResponder.disabled = true;

    const body = {
        UsuarioId: usuarioId,
        Modo: modo,
        PreguntaId: preguntaActual.id, 
        RespuestaUsuario: opcionSeleccionada
    };


    try {
        const res = await fetch(`${apiBase}/api/ControladorAbstraccion/responder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        // Mostrar resultado
        resultadoDiv.textContent = data.correcta ? '¡Correcto! 🎉' : 'Incorrecto 😢';
        resultadoDiv.className = `resultado ${data.correcta ? 'correcto' : 'incorrecto'}`;
        resultadoDiv.classList.remove('hidden');

        // Actualizar racha
        actualizarRacha(data.rachaActual, data.rachaMaxima);

        // Cargar siguiente pregunta automáticamente después de 1s
        setTimeout(() => {
            resultadoDiv.classList.add('hidden');
            cargarPregunta();
            btnResponder.disabled = true;
        }, 1000);

    } catch (err) {
        console.error("Error al enviar respuesta:", err);
        btnResponder.disabled = false;
    }
}
// Eventos
btnResponder.addEventListener('click', () => {
    if (!opcionSeleccionada) return;
    enviarRespuesta();
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarPregunta();
});
