// =========================
// CONFIGURACIÓN
// =========================
const apiBase = 'https://localhost:7131';
const modo = 0; // Secuencias numéricas

const secuenciaContainer = document.getElementById('secuencia');
const resultadoDiv = document.getElementById('resultado');
const input = document.getElementById('respuestaUsuario');
const button = document.getElementById('enviar');
const rachaSpan = document.getElementById('rachaActual');

let secuenciaActual = [];
let secuenciaIdActual = null;

// =========================
// UTILIDADES
// =========================

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

//  Obtener racha inicial
async function cargarRacha() {
    try {
        const res = await fetch(`${apiBase}/api/ControladorDeSecuencias/racha/${usuarioId}/${modo}`);
        const data = await res.json();
        actualizarRacha(data.actual ?? 0);
    } catch (err) {
        console.error("Error cargando racha:", err);
        actualizarRacha(0);
    }
}

//  Obtener secuencia aleatoria
async function cargarSecuencia() {
    try {
        const res = await fetch(`${apiBase}/api/ControladorDeSecuencias/obtener?usuarioId=${usuarioId}&modo=${modo}`);
        const data = await res.json();
        secuenciaActual = data.numeros;
        secuenciaIdActual = data.secuenciaId;
        mostrarSecuencia(secuenciaActual);
    } catch (err) {
        console.error("Error cargando secuencia:", err);
        secuenciaContainer.textContent = "No hay secuencias disponibles 😢";
    }
}

// Animación de la secuencia
function mostrarSecuencia(nums) {
    secuenciaContainer.innerHTML = '';
    nums.forEach((num, index) => {
        const div = document.createElement('div');
        div.className = 'numero';
        div.textContent = num;
        secuenciaContainer.appendChild(div);

        // Animación tipo fade-in y scale
        setTimeout(() => div.classList.add('animate'), index * 500);
        setTimeout(() => div.classList.remove('animate'), (index * 500) + 400);
    });
}

//  Enviar respuesta del usuario
async function enviarRespuesta() {
    const respuestaUsuario = parseInt(input.value);
    if (isNaN(respuestaUsuario) || !secuenciaIdActual) return;

    button.disabled = true; // prevenir doble click


    const body = {
        secuenciaId: secuenciaIdActual,
        respuestaUsuario,
        usuarioId,
        modo
    };

    try {
        const res = await fetch(`${apiBase}/api/ControladorDeSecuencias/responder`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        // Actualizar racha en pantalla
        actualizarRacha(data.rachaActual);

        // Mostrar resultado al usuario
        resultadoDiv.textContent = data.correcta
            ? '¡Correcto! 🎉'
            : `Incorrecto 😢 (Respuesta correcta: ${data.respuestaCorrecta})`;
        resultadoDiv.style.color = data.correcta ? '#0d6efd' : '#ff4c4c';

        // Efecto shake si falla
        if (!data.correcta) {
            input.classList.add('incorrecta');
            setTimeout(() => input.classList.remove('incorrecta'), 500);
        }

        // Limpiar input
        input.value = '';

        // Cargar nueva secuencia 
        if (data.correcta) {
            lanzarParticulas();
            setTimeout(() => {
                cargarSecuencia();
                button.disabled = false;
            }, 1000);
        } else {
            button.disabled = false;
        }

    } catch (err) {
        console.error("Error al enviar respuesta:", err);
        button.disabled = false;
    }
}

// =========================
// EFECTOS
// =========================
function lanzarParticulas() {
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particula';
        p.style.left = `${button.offsetLeft + 20}px`;
        p.style.top = `${button.offsetTop}px`;
        p.style.setProperty('--x', `${(Math.random() - 0.5) * 100}px`);
        p.style.setProperty('--y', `${-(Math.random() * 100)}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

function actualizarRacha(valor) {
    const rachaContainer = document.querySelector('.racha-container');
    const rachaSpan = document.getElementById('rachaActual');
    rachaSpan.textContent = valor;

    // Reiniciar animación 
    rachaContainer.classList.remove('nueva-racha');
    void rachaContainer.offsetWidth;
    rachaContainer.classList.add('nueva-racha');
}

// =========================
// EVENTOS
// =========================
button.addEventListener('click', enviarRespuesta);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarRespuesta();
});

// =========================
// INICIALIZACIÓN
// =========================
cargarRacha();
cargarSecuencia();
