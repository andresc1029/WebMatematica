
    const apiBase = 'https://localhost:7131';
    let numero1, numero2;
    let modoTiempo = false;
    let tiempo = 15; 
    let timerId;
    let tiempoRestante = tiempo;
    const enviar = document.getElementById('enviar');

    async function obtenerMultiplicacion() {
        try {
            const res = await fetch(`${apiBase}/api/ControladorMatematicas/random`);
            const data = await res.json();

            numero1 = data.numero1;
            numero2 = data.numero2;
            document.getElementById('multiplicacion').textContent = `${numero1} x ${numero2}`;
            document.getElementById('respuesta').value = '';
            document.getElementById('respuesta').focus();
            document.getElementById('mensaje').textContent = '';
            document.getElementById('tiempoRestante').textContent = '';
            enviar.disabled = false; // Habilita el botón al cargar nueva pregunta

            if (modoTiempo) {
                iniciarTemporizador();
            } else {
                detenerTemporizador();
            }

        } catch (err) {
            document.getElementById('mensaje').textContent = 'Error al obtener multiplicación.';
            console.error(err);
        }
    }

    async function enviarRespuesta() {
        if (enviar.disabled) return; 
        enviar.disabled = true; 

        const respuestaUsuario = parseInt(document.getElementById('respuesta').value);
        const input = document.getElementById('respuesta');
        input.ariaDisabled = true;
        if (isNaN(respuestaUsuario)) {
            enviar.disabled = false;
            return;
        }

        detenerTemporizador();

        try {
            const res = await fetch(`${apiBase}/api/ControladorMatematicas/pregunta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numero1, numero2, respuestaUsuario, ModoConTiempo: modoTiempo })
            });

            const data = await res.json();

            if (modoTiempo) {
                tiempo = data.tiempoInicio ?? 15;
                tiempoRestante = data.tiempoUsuario ?? tiempo;
                document.getElementById('tiempoRestante').textContent = `⏰ Tiempo: ${tiempoRestante}s`;
            }

            if (data.tiempoAgotado) {
                document.getElementById('mensaje').textContent = '⏰ ¡Se acabó el tiempo!';
                document.getElementById('racha').textContent = `🔥 Racha: ${data.racha}`;
                setTimeout(obtenerMultiplicacion, 2000);
                return;
            }

            if (data.correcto) {
                document.getElementById('racha').textContent = `🔥 Racha: ${data.racha}`;
                document.getElementById('mensaje').textContent = `✅ ¡Correcto!`;
                setTimeout(obtenerMultiplicacion, 1000);
            } else {
                input.ariaDisabled = false;
                document.getElementById('mensaje').textContent = `❌ Incorrecto, tu racha será reiniciada`;
                document.getElementById('respuesta').value = '';
                document.getElementById('respuesta').focus();
                enviar.disabled = false; // //
            }
        } catch (err) {
            document.getElementById('mensaje').textContent = 'Error al validar respuesta.';
            enviar.disabled = false;
            console.error(err);
        }
    }

    // Temporizador
    function iniciarTemporizador() {
        document.getElementById('tiempoRestante').textContent = `⏰ Tiempo: ${tiempoRestante}s`;
        timerId = setInterval(() => {
            tiempoRestante--;
            document.getElementById('tiempoRestante').textContent = `⏰ Tiempo: ${tiempoRestante}s`;
            if (tiempoRestante <= 0) {
                clearInterval(timerId);
                document.getElementById('mensaje').textContent = '⏰ ¡Se acabó el tiempo!';
                document.getElementById('respuesta').ariaDisabled = false;
                enviarRespuesta();
            }
        }, 1000);
    }

    function detenerTemporizador() {
        clearInterval(timerId);
        document.getElementById('tiempoRestante').textContent = '';
    }

    // Eventos
    enviar.addEventListener('click', enviarRespuesta);
    document.getElementById('respuesta').addEventListener('keypress', function(e){
        if(e.key === 'Enter') enviarRespuesta();
    });

    document.getElementById('modoTiempo').addEventListener('click', function() {
        modoTiempo = !modoTiempo;
        this.classList.toggle('btn-warning', modoTiempo);
        this.classList.toggle('btn-outline-warning', !modoTiempo);
        this.textContent = modoTiempo ? 'tiempo : activo' : '¿Tiempo?';
        obtenerMultiplicacion();
    });

obtenerMultiplicacion();


