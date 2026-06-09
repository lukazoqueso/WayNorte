// --- 1. LOGIN WAYNORTE ---
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(document.getElementById("buttonDiv"), { theme: "outline", size: "large" });
};

function handleCredentialResponse() { mostrarMapa(); }
function entrarInvitado() { mostrarMapa(); }

function mostrarMapa() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    document.getElementById('map-legend').style.display = 'block';
    initMap();
}

// --- 2. GESTIÓN DE COMENTARIOS ---
function obtenerComentarios(id) {
    const data = localStorage.getItem(`waynorte_comments_${id}`);
    return data ? JSON.parse(data) : [];
}

window.enviarComentario = function(id) {
    const input = document.getElementById(`input-${id}`);
    const stars = document.getElementById(`stars-${id}`).value;
    const texto = input.value.trim();

    if (texto === "") return;

    const comentarios = obtenerComentarios(id);
    comentarios.push({ c_id: Date.now(), texto, estrellas: stars });
    
    localStorage.setItem(`waynorte_comments_${id}`, JSON.stringify(comentarios));
    input.value = "";
    alert("Comentario guardado. Abre de nuevo el marcador para verlo.");
};

window.eliminarComentario = function(puntoId, comentarioId) {
    if(!confirm("¿Deseas eliminar este comentario?")) return;
    let comentarios = obtenerComentarios(puntoId);
    comentarios = comentarios.filter(c => c.c_id !== comentarioId);
    localStorage.setItem(`waynorte_comments_${puntoId}`, JSON.stringify(comentarios));
    alert("Comentario eliminado.");
};

// --- 3. INICIALIZACIÓN DEL MAPA ---
function initMap() {
    const map = L.map('map').setView([-18.4783, -70.3126], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Grupos de Capas (Filtros)
    const layerTurismo = L.layerGroup().addTo(map);
    const layerReciclaje = L.layerGroup().addTo(map);
    const layerParaderos = L.layerGroup().addTo(map);

    const puntosArica = [
        { id: "morro", nombre: "Morro de Arica", coords: [-18.4811, -70.3208], tipo: "turismo", img: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=400" },
        { id: "chinchorro", nombre: "Playa Chinchorro", coords: [-18.4485, -70.3022], tipo: "turismo", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
        { id: "punto_limpio", nombre: "Punto Limpio Diego Portales", coords: [-18.4745, -70.3010], tipo: "reciclaje", img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400" },
        { id: "paradero_l1", nombre: "Paradero L1 Centro", coords: [-18.4778, -70.3180], tipo: "paradero", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400" }
    ];

    puntosArica.forEach(p => {
        const comentarios = obtenerComentarios(p.id);
        const listaHtml = comentarios.map(c => `
            <div class="comment-item">
                <span><b>${"★".repeat(c.estrellas)}</b> ${c.texto}</span>
                <button class="btn-delete" onclick="eliminarComentario('${p.id}', ${c.c_id})">✕</button>
            </div>
        `).join("");

        const card = `
            <div class="custom-card">
                <img src="${p.img}" class="popup-img">
                <div class="popup-info">
                    <h3>${p.nombre}</h3>
                    <div class="comment-section">
                        <div class="comment-list">${listaHtml || "Sin reseñas"}</div>
                        <select id="stars-${p.id}" class="comment-input">
                            <option value="5">★★★★★</option><option value="4">★★★★</option>
                            <option value="3">★★★</option><option value="2">★★</option><option value="1">★</option>
                        </select>
                        <input type="text" id="input-${p.id}" class="comment-input" placeholder="Tu opinión...">
                        <button onclick="enviarComentario('${p.id}')" class="btn-comment">Publicar</button>
                    </div>
                </div>
            </div>`;
        
        const marker = L.marker(p.coords).bindPopup(card, { className: 'custom-popup' });
        if (p.tipo === "turismo") marker.addTo(layerTurismo);
        else if (p.tipo === "reciclaje") marker.addTo(layerReciclaje);
        else if (p.tipo === "paradero") marker.addTo(layerParaderos);
    });

    const overlays = { "📍 Turismo": layerTurismo, "♻️ Reciclaje": layerReciclaje, "🚌 Paraderos": layerParaderos };
    L.control.layers(null, overlays, { collapsed: false }).addTo(map);

    // --- GPS Y BOTÓN DE UBICACIÓN ---
    const gpsIcon = L.divIcon({ className: 'user-location-icon', iconSize: [14, 14], iconAnchor: [7, 7] });
    let userMarker = L.marker([0, 0], { icon: gpsIcon }).addTo(map);
    let currentLatLng = null;

    map.locate({ watch: true, setView: false }); // Detectar pero NO mover solo
    map.on('locationfound', (e) => {
        currentLatLng = e.latlng;
        userMarker.setLatLng(e.latlng);
    });

    window.centrarEnUsuario = function() {
        if (currentLatLng) map.setView(currentLatLng, 16);
        else alert("Buscando señal GPS...");
    };
}