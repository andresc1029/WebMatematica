const apiBase = 'https://localhost:7131';
const verifyForm = document.getElementById("verifyForm");

// Creamos un div para mensajes dentro de la card
const messageBox = document.createElement("div");
messageBox.style.marginBottom = "15px";
messageBox.style.opacity = "0";
messageBox.style.transition = "opacity 0.5s";
verifyForm.prepend(messageBox);

// Función para mostrar mensajes
function showMessage(msg, type = "info") {
    messageBox.textContent = msg;
    messageBox.style.color = type === "error" ? "#ff4d4f" : type === "success" ? "#0d6efd" : "#ccc";
    messageBox.style.opacity = "1";
    setTimeout(() => { messageBox.style.opacity = "0"; }, 4000);
}

// Obtenemos el correo ingresado en la página anterior
const correo = sessionStorage.getItem("correoRecuperacion");
if (!correo) {
    showMessage("Debes volver a ingresar tu correo.", "error");
    setTimeout(() => window.location.href = "/recover.html", 1500);
}

if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = document.getElementById("code").value.trim();
        if (!token) {
            showMessage("Debes ingresar el código.", "error");
            return;
        }

        showMessage("Verificando código...", "info");

        try {
            const res = await fetch(`${apiBase}/api/ControladorRecuperacionContrasena/ValidarCodigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    CorreoUsuario: correo,
                    Token: token
                })
            });

            const data = await res.json();

            if (!res.ok) {
                showMessage(data.mensaje || "Código inválido.", "error");
                return;
            }

            showMessage("Código verificado correctamente.", "success");

            // Guardamos temporalmente el token para el siguiente paso
            sessionStorage.setItem("tokenRecuperacion", token);

            // Redirigir a la página de cambiar contraseña
            setTimeout(() => window.location.href = "/ReinicioContraseña", 1500);

        } catch (err) {
            console.error(err);
            showMessage("Error de conexión con el servidor.", "error");
        }
    });
}
