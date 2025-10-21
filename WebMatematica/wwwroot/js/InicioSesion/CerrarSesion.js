document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.getElementById("CerrarSesion");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            // Limpiar todo lo guardado en localStorage
            localStorage.removeItem("usuario");
            localStorage.removeItem("token");
            localStorage.removeItem("correoRecuperacion");
            localStorage.removeItem("tokenRecuperacion");
            localStorage.clear()

            // Redirigir a la página de inicio o login
            window.location.replace("/Index");
            
        });
    }
});