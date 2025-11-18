const apiBase = 'https://localhost:7131';
const resetForm = document.getElementById("resetForm");

// Creamos un div para mostrar mensajes dentro de la card
const messageBox = document.createElement("div");
messageBox.style.marginBottom = "15px";
messageBox.style.opacity = "0";
messageBox.style.transition = "opacity 0.5s";
resetForm.prepend(messageBox);

// Función para mostrar mensajes
function showMessage(msg, type = "info") {
    messageBox.textContent = msg;
    messageBox.style.color = type === "error" ? "#ff4d4f" : type === "success" ? "#0d6efd" : "#ccc";
    messageBox.style.opacity = "1";
    setTimeout(() => { messageBox.style.opacity = "0"; }, 4000);
}

// correo y token desde sessionStorage
const correo = sessionStorage.getItem("correoRecuperacion");
const token = sessionStorage.getItem("tokenRecuperacion");

if (!correo || !token) {
    showMessage("Debes iniciar el proceso desde el correo.", "error");
    setTimeout(() => window.location.href = "/Index", 1500);
}

if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!password || !confirmPassword) {
            showMessage("Debes completar ambos campos.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Las contraseñas no coinciden.", "error");
            return;
        }

        showMessage("Actualizando contraseña...", "info");

        try {
            const res = await fetch(`${apiBase}/api/ControladorRecuperacionContrasena/Restablecer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    CorreoUsuario: correo,
                    Token: token,
                    NuevaContraseña: password
                })
            });

            let data;
            try {
                data = await res.json();
            } catch {
                data = { mensaje: "Respuesta inválida del servidor" };
            }

            if (!res.ok) {
                showMessage(data.mensaje || "Error al actualizar contraseña.", "error");
                return;
            }

            console.log("Respuesta del servidor:", data);

            showMessage("Contraseña actualizada correctamente.", "success");

            // Limpiamos sessionStorage
            sessionStorage.removeItem("correoRecuperacion");
            sessionStorage.removeItem("tokenRecuperacion");

            // Redirigir al login
            setTimeout(() => {
                window.location.href = "/Index";
            }, 1500);

        } catch (err) {
            console.error(err);
            showMessage("Error de conexión con el servidor.", "error");
        }
    });
}
