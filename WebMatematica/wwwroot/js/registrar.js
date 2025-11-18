const apiBase = 'https://localhost:7131';
const form = document.getElementById('registroForm');
const mensajeDiv = document.getElementById('mensajeRegistro');
const btn = form.querySelector('button[type=submit]');

//  Mostrar/Ocultar contraseña
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const inputId = button.getAttribute("data-target");
        const input = document.getElementById(inputId);

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "🕶️";
        } else {
            input.type = "password";
            button.textContent = "👁";
        }
    });
});

//  Validar confirmación antes de enviar
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    mensajeDiv.textContent = '';
    mensajeDiv.style.color = '#fff';

    const nombreUsuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const confirmarContrasena = document.getElementById('confirmarContrasena').value.trim();
    const correo = document.getElementById('correo').value.trim();

    console.log({ nombreUsuario, contrasena, correo }); 

    // Validación de contraseñas
    if (contrasena !== confirmarContrasena) {
        mensajeDiv.style.color = 'red';
        mensajeDiv.textContent = '❌ Las contraseñas no coinciden';
        ['contrasena', 'confirmarContrasena'].forEach(id => {
            const input = document.getElementById(id);
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        });
        btn.disabled = false;
        return;
    }
 
    try {
        const res = await fetch(`${apiBase}/api/ControladorUsuarios/Registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreUsuario, contrasena, Correo: correo })


        });

        const data = await res.json();

        if (res.ok) {
            mensajeDiv.style.color = 'green';
            mensajeDiv.textContent = '✅ Registro exitoso. Redirigiendo...';
            setTimeout(() => window.location.href = '/Index', 1500);
        } else {
            mensajeDiv.style.color = 'red';
            mensajeDiv.textContent = data.mensaje || '❌ Error en el registro';
            ['usuario', 'contrasena', 'correo'].forEach(id => {
                const input = document.getElementById(id);
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            });
        }

    } catch (err) {
        console.error(err);
        mensajeDiv.style.color = 'red';
        mensajeDiv.textContent = '❌ Ocurrió un error';
    } finally {
        btn.disabled = false;
    }
});

