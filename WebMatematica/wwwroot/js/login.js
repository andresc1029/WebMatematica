const apiBase = 'https://localhost:7131';

const form = document.querySelector("#loginForm");
const mensajeDiv = document.getElementById("mensajeLogin");
const loginBtn = form.querySelector("button[type=submit]");

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        const payload = parseJwt(token);
        const exp = payload?.exp * 1000; // 'exp' viene en segundos

        if (Date.now() < exp) {
            // Token aún válido → redirige al usuario
            window.location.href = "/PaginaPrincipal";
        } else {
            // Token expiró, eliminarlo
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
        }
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    loginBtn.disabled = true; 
    mensajeDiv.textContent = ""; 

    const nombreUsuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contraseña").value;



    try {
        const res = await fetch(`${apiBase}/api/ControladorUsuarios/Login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombreUsuario, contrasena })
        });

        const data = await res.json(); 

        if (res.ok) {
            console.log("Login exitoso:", data);
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", data.nombreUsuario);
            mensajeDiv.style.color = "green";
            mensajeDiv.textContent = "Login exitoso. Redirigiendo...";
            window.location.href = "/PaginaPrincipal";
        } else if (res.status === 401) {
            mensajeDiv.style.color = "red";
            mensajeDiv.textContent = data.mensaje || "Usuario o contraseña incorrecta";
        } else {
            throw new Error("Error en la solicitud: " + res.status);
        }
    } catch (err) {
        console.error("Error fetch:", err);
        mensajeDiv.style.color = "red";
        mensajeDiv.textContent = "Ocurrió un error al iniciar sesión";
    } finally {
        loginBtn.disabled = false;
    }
});




