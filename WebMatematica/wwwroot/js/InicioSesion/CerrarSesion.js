document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.getElementById("btnCerrarSesion");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            // Limpiar todo lo guardado en localStorage
            localStorage.removeItem("usuario");
            localStorage.removeItem("token");
            localStorage.removeItem("correoRecuperacion");
            localStorage.removeItem("tokenRecuperacion");

            // Redirigir a la página de inicio o login
            window.location.href = "/Index";
        });
    }
});