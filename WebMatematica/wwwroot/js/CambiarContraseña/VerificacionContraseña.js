const apiBase = 'https://localhost:7131';
const recoverForm = document.getElementById("recoverForm");
const messageBox = document.getElementById("messageBox"); // div en la card

function showMessage(msg, type = "info") {
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.style.color = type === "error" ? "#ff4d4f" : type === "success" ? "#0d6efd" : "#ccc";
    messageBox.style.opacity = "1";
    setTimeout(() => { messageBox.style.opacity = "0"; }, 4000);
}

if (recoverForm) {
    recoverForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const correo = document.getElementById("email").value.trim();
        if (!correo) {
            showMessage("Debes ingresar un correo.", "error");
            return;
        }

        showMessage("Enviando código...", "info");

        try {
            const res = await fetch(`${apiBase}/api/ControladorRecuperacionContrasena/EnviarCodigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ CorreoUsuario: correo })
            });

            const data = await res.json();

            if (!res.ok) {
                showMessage(data.mensaje || "Error enviando el código.", "error");
                return;
            }

            showMessage("Código enviado correctamente.", "success");
            sessionStorage.setItem("correoRecuperacion", correo);

            setTimeout(() => window.location.href = "/CodigoVerificacion", 1500);

        } catch (err) {
            console.error(err);
            showMessage("Error de conexión con el servidor.", "error");
        }
    });
}
