const apiBase = 'https://localhost:7131';
const modo = 0; // Secuencias numéricas

/*  ELEMENTOS DEL DOM  */
const secuenciaContainer = document.querySelector('.secuencia-container');
const resultadoDiv = document.getElementById('resultado');
const input = document.getElementById('respuestaUsuario');
const button = document.getElementById('enviar');
const rachaSpan = document.getElementById('rachaActual');
const rachaContainer = document.querySelector('.racha-container');

/*  VARIABLES  */
let secuenciaActual = [];
let secuenciaIdActual = null;
let usuarioId = null;
let esperandoRespuesta = false;

/*  FUNCIONES  */

// Extraer payload del JWT
function parseJwt(token) {
    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

// Obtener usuarioId desde token
function obtenerUsuarioId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.userId ? Number(payload.userId) : null;
}

// Actualizar racha en pantalla
function actualizarRacha(valor) {
    rachaSpan.textContent = valor ?? 0;
    rachaContainer.classList.remove('nueva-racha');
    void rachaContainer.offsetWidth;
    rachaContainer.classList.add('nueva-racha');
}

// Mostrar secuencia en la UI
function mostrarSecuencia(nums) {
    secuenciaContainer.innerHTML = '';
    nums.forEach((num) => {
        const div = document.createElement('div');
        div.className = 'numero-box';
        div.textContent = num;
        secuenciaContainer.appendChild(div);
    });
}

// Obtener racha inicial del servidor
async function cargarRacha() {
    if (!usuarioId) return;
    try {
        const res = await fetch(`${apiBase}/api/ControladorDeSecuencias/racha/${usuarioId}/${modo}`);
        const data = await res.json();
        actualizarRacha(data.actual ?? 0);
    } catch (err) {
        console.error("Error cargando racha:", err);
        actualizarRacha(0);
    }
}

// Obtener secuencia aleatoria del servidor
async function cargarSecuencia() {
    if (!usuarioId) return;
    try {
        const res = await fetch(`${apiBase}/api/ControladorDeSecuencias/obtener?usuarioId=${usuarioId}&modo=${modo}`);
        const data = await res.json();

        if (!data || !data.numeros || !data.secuenciaId) {
            throw new Error("Datos de secuencia inválidos");
        }

        secuenciaActual = data.numeros;
        secuenciaIdActual = data.secuenciaId;
        mostrarSecuencia(secuenciaActual);

    } catch (err) {
        console.error("Error cargando secuencia:", err);
        secuenciaContainer.textContent = "No hay secuencias disponibles 😢";
    }
}

// Enviar respuesta del usuario
async function enviarRespuesta() {
    if (esperandoRespuesta || !usuarioId || !secuenciaIdActual) return;
    esperandoRespuesta = true;
    button.disabled = true;

    const respuestaUsuario = parseInt(input.value);
    if (isNaN(respuestaUsuario)) {
        esperandoRespuesta = false;
        button.disabled = false;
        return;
    }

    const body = {
        secuenciaId: secuenciaIdActual,
        respuestaUsuario,
        usuarioId,
        modo
    };

    try {
        const res = await fetch(`${apiBase}/api/ControladorDeSecuencias/responder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        actualizarRacha(data.rachaActual);

        resultadoDiv.textContent = data.correcta ? '¡Correcto! 🎉' : 'Incorrecto 😢';
        resultadoDiv.className = 'resultado ' + (data.correcta ? 'correcto' : 'incorrecto');

        input.value = '';

        // Cargar nueva secuencia 
        setTimeout(() => {
            resultadoDiv.textContent = '';
            cargarSecuencia();
            esperandoRespuesta = false;
            button.disabled = false;
        }, 800);

    } catch (err) {
        console.error("Error al enviar respuesta:", err);
        esperandoRespuesta = false;
        button.disabled = false;
    }
}
/*  EVENTOS  */
button.addEventListener('click', enviarRespuesta);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarRespuesta();
});

/*  INICIALIZACIÓN  */
usuarioId = obtenerUsuarioId();

if (!usuarioId) {
    alert("No se pudo identificar el usuario. Por favor inicia sesión de nuevo.");
} else {
    cargarRacha();
    cargarSecuencia();
}
