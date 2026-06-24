// --- 1. SISTEMA DE USUARIOS WAYNORTE ---

let usuarioActual = null; 

async function registrarUsuario() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!email || !password) {
        return alert("Por favor, ingresa tu correo y contraseña para registrarte.");
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }) 
        });

        const data = await respuesta.json(); 

        if (!respuesta.ok) {
            alert(data.error); 
        } else {
            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            document.getElementById('auth-password').value = ''; 
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor de base de datos.");
    }
}

async function iniciarSesion() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!email || !password) {
        return alert("Por favor, ingresa tu correo y contraseña.");
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.error); 
        } else {
            usuarioActual = data.usuario; 
            alert(`¡Bienvenido a WayNorte, ${usuarioActual.email}!`);
            mostrarMapa(); 
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

function mostrarMapa() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    document.getElementById('map-legend').style.display = 'block';
    initMap(); 
}


// --- 2. GESTIÓN DE COMENTARIOS REALES (CON BACKEND) ---

// # Envía un comentario nuevo vinculado al marcador y al usuario logueado
window.enviarComentario = async function(marcadorId) {
    const input = document.getElementById(`input-${marcadorId}`);
    const stars = document.getElementById(`stars-${marcadorId}`).value;
    const texto = input.value.trim();

    if (texto === "") return; 

    try {
        const respuesta = await fetch('http://localhost:3000/api/comentarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                marcador_id: marcadorId,
                usuario_id: usuarioActual.id, // # Aquí vinculamos la ID del autor real
                texto: texto,
                estrellas: parseInt(stars)
            })
        });

        if (respuesta.ok) {
            input.value = ""; 
            alert("Reseña publicada con éxito.");
            // # Pequeño truco técnico: cerramos el popup para obligar a que se refresque con el nuevo dato al reabrirlo
            document.querySelector('.leaflet-popup-close-button').click();
        } else {
            alert("No se pudo guardar la reseña.");
        }
    } catch (error) {
        console.error("Error al publicar comentario:", error);
    }
};

// # Elimina un comentario de la base de datos verificando si eres el autor original
window.eliminarComentario = async function(comentarioId, autorId) {
    // # Control de negocio: Un usuario no puede borrar comentarios de otras personas
    if (usuarioActual.id !== autorId) {
        return alert("Disculpa, solo puedes eliminar tus propias reseñas.");
    }

    if (!confirm("¿Deseas eliminar este comentario permanentemente?")) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/comentarios/${comentarioId}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            alert("Comentario eliminado.");
            document.querySelector('.leaflet-popup-close-button').click();
        }
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
    }
};

// # Función dinámica que consulta al backend los comentarios de un pin justo cuando el usuario hace clic
async function cargarComentariosPopup(marcadorId) {
    try {
        const respuesta = await fetch(`http://localhost:3000/api/comentarios/${marcadorId}`);
        const comentarios = await respuesta.json();

        const listaHtml = comentarios.map(c => `
            <div class="comment-item" style="border-left: 3px solid ${usuarioActual.id === c.usuario_id ? '#2ed573' : '#1e90ff'}">
                <span>
                    <b>${"★".repeat(c.estrellas)}</b> <br>
                    <small style="color: #888">${c.email.split('@')[0]}:</small> ${c.texto}
                </span>
                ${usuarioActual.id === c.usuario_id ? `<button class="btn-delete" onclick="eliminarComentario(${c.id}, ${c.usuario_id})">✕</button>` : ''}
            </div>
        `).join("");

        document.getElementById(`comment-list-${marcadorId}`).innerHTML = listaHtml || "Sin reseñas aún. ¡Sé el primero!";
    } catch (error) {
        console.error("Error cargando comentarios:", error);
    }
}


// --- 3. INICIALIZACIÓN DEL MAPA ---

async function initMap() {
    const map = L.map('map').setView([-18.4783, -70.3126], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const layerTurismo = L.layerGroup().addTo(map);
    const layerReciclaje = L.layerGroup().addTo(map);
    const layerParaderos = L.layerGroup().addTo(map);

    try {
        const respuesta = await fetch('http://localhost:3000/api/marcadores');
        const puntosArica = await respuesta.json(); 

        puntosArica.forEach(p => {
            const iconTurismo = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
            const iconReciclaje = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
            const iconParadero = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

            // # Construimos la tarjeta visual dejando un contenedor vacío con una ID única para inyectar los comentarios dinámicamente
            const card = `
                <div class="custom-card">
                    <img src="${p.img}" class="popup-img">
                    <div class="popup-info">
                        <h3>${p.nombre}</h3>
                        <div class="comment-section">
                            <div class="comment-list" id="comment-list-${p.id}">Cargando opiniones...</div>
                            <select id="stars-${p.id}" class="comment-input">
                                <option value="5">★★★★★</option><option value="4">★★★★</option>
                                <option value="3">★★★</option><option value="2">★★</option><option value="1">★</option>
                            </select>
                            <input type="text" id="input-${p.id}" class="comment-input" placeholder="Tu opinión...">
                            <button onclick="enviarComentario('${p.id}')" class="btn-comment">Publicar</button>
                        </div>
                    </div>
                </div>`;
            
            let iconoActual;
            if (p.tipo === "turismo") iconoActual = iconTurismo;
            else if (p.tipo === "reciclaje") iconoActual = iconReciclaje;
            else if (p.tipo === "paradero") iconoActual = iconParadero;

            const coordenadasReales = [parseFloat(p.latitud), parseFloat(p.longitud)];

            const marker = L.marker(coordenadasReales, { icon: iconoActual }).bindPopup(card, { className: 'custom-popup' });
            
            // # ESCUCHADOR CLAVE: Cuando el usuario abra este popup específico, mandamos a pedir sus comentarios reales
            marker.on('popupopen', () => {
                cargarComentariosPopup(p.id);
            });

            if (p.tipo === "turismo") marker.addTo(layerTurismo);
            else if (p.tipo === "reciclaje") marker.addTo(layerReciclaje);
            else if (p.tipo === "paradero") marker.addTo(layerParaderos);
        });

        const overlays = { "📍 Turismo": layerTurismo, "♻️ Reciclaje": layerReciclaje, "🚌 Paraderos": layerParaderos };
        L.control.layers(null, overlays, { collapsed: false }).addTo(map);

        // --- GPS ---
        const gpsIcon = L.divIcon({ className: 'user-location-icon', iconSize: [14, 14], iconAnchor: [7, 7] });
        let userMarker = L.marker([0, 0], { icon: gpsIcon }).addTo(map);
        let currentLatLng = null;

        map.locate({ watch: true, setView: false }); 
        map.on('locationfound', (e) => {
            currentLatLng = e.latlng;
            userMarker.setLatLng(e.latlng);
        });

        window.centrarEnUsuario = function() {
            if (currentLatLng) map.setView(currentLatLng, 16);
            else alert("Buscando señal GPS...");
        };

    } catch (error) {
        console.error("Error al conectar con el servidor de WayNorte:", error);
        alert("No se pudieron cargar los marcadores desde la base de datos.");
    }
}