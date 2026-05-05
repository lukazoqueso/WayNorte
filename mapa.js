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
    comentarios.push({ 
        c_id: Date.now(), 
        texto, 
        estrellas: stars 
    });
    
    localStorage.setItem(`waynorte_comments_${id}`, JSON.stringify(comentarios));
    input.value = "";
    alert("Comentario guardado en WayNorte. Recarga el marcador para verlo.");
};

window.eliminarComentario = function(puntoId, comentarioId) {
    if(!confirm("¿Deseas eliminar este comentario de WayNorte?")) return;
    
    let comentarios = obtenerComentarios(puntoId);
    comentarios = comentarios.filter(c => c.c_id !== comentarioId);
    
    localStorage.setItem(`waynorte_comments_${puntoId}`, JSON.stringify(comentarios));
    alert("Comentario eliminado correctamente.");
};

// --- 3. INICIALIZACIÓN DEL MAPA ---
function initMap() {
    const map = L.map('map').setView([-18.4783, -70.3126], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Icono GPS WayNorte
    const gpsIcon = L.divIcon({ className: 'user-location-icon', iconSize: [14, 14], iconAnchor: [7, 7] });
    let userMarker = L.marker([0, 0], { icon: gpsIcon }).addTo(map);
    map.locate({ setView: true, watch: true });
    map.on('locationfound', (e) => userMarker.setLatLng(e.latlng));

    const puntosArica = [
        { id: "morro", nombre: "Morro de Arica", coords: [-18.4811, -70.3208], tipo: "Histórico", img: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=400" },
        { id: "chinchorro", nombre: "Playa Chinchorro", coords: [-18.4485, -70.3022], tipo: "Turismo", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
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
                        <div class="comment-list">${listaHtml || "Sin reseñas en WayNorte"}</div>
                        <select id="stars-${p.id}" class="comment-input">
                            <option value="5">★★★★★</option>
                            <option value="4">★★★★</option>
                            <option value="3">★★★</option>
                            <option value="2">★★</option>
                            <option value="1">★</option>
                        </select>
                        <input type="text" id="input-${p.id}" class="comment-input" placeholder="Tu opinión...">
                        <button onclick="enviarComentario('${p.id}')" class="btn-comment">Publicar en WayNorte</button>
                    </div>
                </div>
            </div>`;
        
        L.marker(p.coords).addTo(map).bindPopup(card, { className: 'custom-popup' });
    });
}